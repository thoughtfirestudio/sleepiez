from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import Challenge, ChallengeSubmission, User, League
from app.routers.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.get("")
def list_challenges(db: Session = Depends(get_db)):
    """List all challenges with user's submission status."""
    now = datetime.now(timezone.utc)
    challenges = db.query(Challenge).order_by(Challenge.week_number).all()
    return [
        {
            "id": str(c.id),
            "week_number": c.week_number,
            "title": c.title,
            "description": c.description,
            "opens_at": c.opens_at.isoformat(),
            "closes_at": c.closes_at.isoformat(),
            "is_open": c.opens_at <= now <= c.closes_at,
            "is_past": now > c.closes_at,
            "is_future": now < c.opens_at,
            "question_count": len(c.questions or []),
        }
        for c in challenges
    ]


@router.get("/current")
def get_current_challenge(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently active challenge with questions (no questions if already submitted)."""
    from app.models import ChallengeSubmission
    now = datetime.now(timezone.utc)
    challenge = db.query(Challenge).filter(
        Challenge.opens_at <= now,
        Challenge.closes_at > now,
    ).order_by(Challenge.week_number).first()

    has_submitted = None
    if challenge:
        sub = db.query(ChallengeSubmission).filter(
            ChallengeSubmission.challenge_id == challenge.id,
            ChallengeSubmission.user_id == user.id,
        ).first()
        if sub:
            has_submitted = {"score": sub.score, "total": len(challenge.questions or [])}

    if not challenge:
        challenge = db.query(Challenge).filter(
            Challenge.opens_at > now,
        ).order_by(Challenge.opens_at).first()
        if not challenge:
            raise HTTPException(404, "No challenges found")
        return {
            "id": str(challenge.id),
            "week_number": challenge.week_number,
            "title": challenge.title,
            "description": challenge.description,
            "opens_at": challenge.opens_at.isoformat(),
            "closes_at": challenge.closes_at.isoformat(),
            "questions": challenge.questions or [],
            "is_open": False,
            "submission": has_submitted,
        }

    return {
        "id": str(challenge.id),
        "week_number": challenge.week_number,
        "title": challenge.title,
        "description": challenge.description,
        "opens_at": challenge.opens_at.isoformat(),
        "closes_at": challenge.closes_at.isoformat(),
        "questions": challenge.questions or [],
        "is_open": True,
        "submission": has_submitted,
    }


@router.post("/{challenge_id}/submit")
def submit_challenge(
    challenge_id: str,
    answers: list[int],
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit answers for a challenge. Auto-graded."""
    from uuid import UUID

    try:
        cid = UUID(challenge_id)
    except ValueError:
        raise HTTPException(400, "Invalid challenge ID")

    challenge = db.query(Challenge).filter(Challenge.id == cid).first()
    if not challenge:
        raise HTTPException(404, "Challenge not found")

    now = datetime.now(timezone.utc)
    if not (challenge.opens_at <= now <= challenge.closes_at):
        raise HTTPException(400, "Challenge is not currently open")

    # Check for existing submission
    existing = db.query(ChallengeSubmission).filter(
        ChallengeSubmission.challenge_id == cid,
        ChallengeSubmission.user_id == user.id,
    ).first()
    if existing:
        raise HTTPException(409, "Already submitted this challenge")

    questions = challenge.questions or []
    if len(answers) != len(questions):
        raise HTTPException(400, f"Expected {len(questions)} answers, got {len(answers)}")

    # Auto-grade
    score = 0
    for i, q in enumerate(questions):
        if i < len(answers) and answers[i] == q.get("correct"):
            score += 1

    submission = ChallengeSubmission(
        challenge_id=cid,
        user_id=user.id,
        answers=answers,
        score=score,
    )
    db.add(submission)
    db.commit()

    return {"ok": True, "score": score, "total": len(questions)}


@router.get("/standings")
def get_standings(db: Session = Depends(get_db)):
    """Get cumulative standings across all completed challenges."""
    from app.models import Team

    now = datetime.now(timezone.utc)

    # Get all submissions with user info
    results = (
        db.query(
            ChallengeSubmission.user_id,
            db.func.sum(ChallengeSubmission.score).label("total_score"),
            db.func.count(ChallengeSubmission.id).label("completed"),
        )
        .group_by(ChallengeSubmission.user_id)
        .all()
    )

    # Build standings
    standings = []
    teams_by_owner = {}
    teams = db.query(Team).all()
    for t in teams:
        if t.owner:
            teams_by_owner[t.owner.id] = {"team": t.name, "abbreviation": t.abbreviation}

    for r in results:
        team_info = teams_by_owner.get(r.user_id, {})
        standings.append({
            "user_id": str(r.user_id),
            "display_name": db.query(User).filter(User.id == r.user_id).first().display_name if r.user_id else "Unknown",
            "team_name": team_info.get("team", "?"),
            "abbreviation": team_info.get("abbreviation", "?"),
            "total_score": r.total_score or 0,
            "challenges_completed": r.completed or 0,
        })

    # Sort by score descending
    standings.sort(key=lambda s: s["total_score"], reverse=True)

    # Assign draft order
    for i, s in enumerate(standings):
        s["draft_pick"] = i + 1

    # Get total available challenges (past + current)
    total_challenges = db.query(Challenge).filter(
        Challenge.opens_at <= now
    ).count()

    return {
        "standings": standings,
        "total_challenges": total_challenges,
        "draft_date": "2026-08-26",
    }
