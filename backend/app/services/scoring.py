"""Scoring engine — converts raw stats to fantasy points."""

from typing import Any


def calculate_fantasy_points(stats: dict[str, Any]) -> float:
    """Convert a raw Sleeper stat JSONB dict to fantasy points (0.5 PPR).

    Stat keys match the Sleeper API's raw stat field names.
    """
    pts = 0.0

    # Passing
    pts += float(stats.get("pass_yds", 0)) * 0.04
    pts += float(stats.get("pass_td", 0)) * 6
    pts += float(stats.get("pass_int", 0)) * -2

    # Rushing
    pts += float(stats.get("rush_yds", 0)) * 0.1
    pts += float(stats.get("rush_td", 0)) * 6

    # Receiving (0.5 PPR)
    pts += float(stats.get("rec", 0)) * 0.5
    pts += float(stats.get("rec_yds", 0)) * 0.1
    pts += float(stats.get("rec_td", 0)) * 6

    # Penalties
    pts += float(stats.get("fumbles_lost", 0)) * -2
    pts += float(stats.get("bonus", 0))  # 2PT conversions

    # Kicking
    fg_made = float(stats.get("fg_made", 0))
    fg_50plus = float(stats.get("fg_made_50_plus", 0))
    pts += fg_made * 3
    pts += fg_50plus * 2  # extra bonus for 50+ yarders
    pts += float(stats.get("pat_made", 0)) * 1

    # Defense / Special Teams
    pts += float(stats.get("def_td", 0)) * 6
    pts += float(stats.get("def_int", 0)) * 2
    pts += float(stats.get("def_fum_rec", 0)) * 2
    pts += float(stats.get("def_sack", 0)) * 1
    pts += float(stats.get("def_safety", 0)) * 2

    return round(pts, 1)
