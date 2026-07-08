-- Fix challenge dates to Wed-Wed
DELETE FROM challenge_submissions;
DELETE FROM challenges;

-- Week 1: Jul 8 (Wed) - Jul 15 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (1, '2010s Pop & Indie', 'The decade that brought us everything from dubstep to folk revival.', '[
  {"q":"Which 2011 album by Bon Iver won Best Alternative Music Album at the Grammys?","options":["For Emma, Forever Ago","Bon Iver, Bon Iver","22, A Million","i,i"],"correct":1},
  {"q":"What year did Daft Punk release Random Access Memories?","options":["2011","2012","2013","2014"],"correct":2},
  {"q":"Which indie band released the 2010 album The Suburbs?","options":["Arcade Fire","Vampire Weekend","The National","Fleet Foxes"],"correct":0},
  {"q":"What was the name of Skrillexs breakout 2010 EP?","options":["Bangarang","Scary Monsters and Nice Sprites","Recess","My Name Is Skrillex"],"correct":1},
  {"q":"Lorde was how old when Royals hit #1 in 2013?","options":["16","17","18","19"],"correct":0}
]'::jsonb, '2026-07-08T00:00:00Z', '2026-07-15T00:00:00Z');

-- Week 2: Jul 15 (Wed) - Jul 22 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (2, 'Movie Trivia', 'From cult classics to box office monsters.', '[
  {"q":"In Inception, how many levels of dreaming are there?","options":["3","4","5","6"],"correct":1},
  {"q":"Which movie won Best Picture in 2020?","options":["1917","Parasite","Joker","Once Upon a Time in Hollywood"],"correct":1},
  {"q":"What is the highest-grossing film of all time (not adjusted for inflation)?","options":["Avengers: Endgame","Avatar","Titanic","Star Wars: TFA"],"correct":1},
  {"q":"Which actor played the Joker before Heath Ledger?","options":["Jack Nicholson","Mark Hamill","Cesar Romero","All of the above"],"correct":3},
  {"q":"The word Hodor comes from which phrase in Game of Thrones?","options":["Hold the door","Home of the dragon","Hollow order","Honor the dead"],"correct":0}
]'::jsonb, '2026-07-15T00:00:00Z', '2026-07-22T00:00:00Z');

-- Week 3: Jul 22 (Wed) - Jul 29 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (3, 'Breaking Bad', 'Say my name. Say the right answers.', '[
  {"q":"What is Walter Whites teaching subject?","options":["Chemistry","Physics","Biology","Math"],"correct":0},
  {"q":"What color was the meth that made Heisenberg famous?","options":["Blue","Pink","White","Green"],"correct":0},
  {"q":"Which fast-food chain did Gus Fring own as a front?","options":["Los Pollos Hermanos","Los Tacos Amigos","El Pollo Loco","Chick-fil-A"],"correct":0},
  {"q":"What was Jesse Pinkmans catchphrase?","options":["Science, bitch!","Yo, bitch!","Yeah, bitch!","Magnets, bitch!"],"correct":2},
  {"q":"How many seasons of Breaking Bad were there?","options":["4","5","6","7"],"correct":1}
]'::jsonb, '2026-07-22T00:00:00Z', '2026-07-29T00:00:00Z');

-- Week 4: Jul 29 (Wed) - Aug 5 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (4, 'Lord of the Rings', 'One does not simply walk into Mordor. But you can answer these.', '[
  {"q":"How many rings were given to the race of Men?","options":["3","7","9","1"],"correct":2},
  {"q":"What is the name of Aragorns sword?","options":["Glamdring","Sting","Narsil","Anduril"],"correct":3},
  {"q":"Who said You shall not pass!?","options":["Aragorn","Legolas","Gandalf","Elrond"],"correct":2},
  {"q":"What creature is Gollums original name?","options":["Smeagol","Deagol","Hobbit","Stoor"],"correct":0},
  {"q":"What is the only thing that can destroy the One Ring?","options":["Dragons fire","Mount Doom","Elven magic","The Valar"],"correct":1}
]'::jsonb, '2026-07-29T00:00:00Z', '2026-08-05T00:00:00Z');

-- Week 5: Aug 5 (Wed) - Aug 12 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (5, 'Star Wars', 'These are the trivia questions you are looking for.', '[
  {"q":"What is Han Solos ships name?","options":["Millennium Falcon","Star Destroyer","X-Wing","Slave I"],"correct":0},
  {"q":"What is the name of Lukes home planet?","options":["Alderaan","Tatooine","Naboo","Coruscant"],"correct":1},
  {"q":"Who built C-3PO?","options":["Obi-Wan Kenobi","Anakin Skywalker","Padme Amidala","Darth Sidious"],"correct":1},
  {"q":"How many Death Stars were built?","options":["1","2","3","4"],"correct":1},
  {"q":"What color is Mace Windus lightsaber?","options":["Blue","Green","Purple","Red"],"correct":2}
]'::jsonb, '2026-08-05T00:00:00Z', '2026-08-12T00:00:00Z');

-- Week 6: Aug 12 (Wed) - Aug 19 (Wed)
INSERT INTO challenges (week_number, title, description, questions, opens_at, closes_at) VALUES (6, 'EDM & Festival Culture', 'Drop the bass. Drop the answers.', '[
  {"q":"Which festival is known as the worlds biggest electronic dance music festival?","options":["Ultra","Tomorrowland","EDC","Coachella"],"correct":1},
  {"q":"What EDM artist produced the 2014 hit Strobe?","options":["Deadmau5","Avicii","Martin Garrix","Skrillex"],"correct":0},
  {"q":"Levels by Avicii samples which older track?","options":["Show Me Love (Robin S)","Finally (CeCe Peniston)","Something Got a Hold on Me (Etta James)","One More Time (Daft Punk)"],"correct":0},
  {"q":"What was the name of Flumes breakout 2016 album?","options":["Skin","Hi This Is Flume","Flume","Palaces"],"correct":0},
  {"q":"Which DJ famously wears a mouse helmet?","options":["Marshmello","Deadmau5","Daft Punk","Knife Party"],"correct":1}
]'::jsonb, '2026-08-12T00:00:00Z', '2026-08-19T00:00:00Z');
