# Writing cinematic shot prompts for every ayah (مَشهَدآية)

Goal: for each ayah, 1–3 short English image prompts that show its meaning **as explained by Tafsir al-Muyassar**
(public/data/tafsir.json), so a viewer understands the ayah by looking. The app adds the visual style
(cinematic photo or anime) and fixed safety words itself — write only the scene content.

## Hard rules (never break)
- Never depict Allah, any symbol meant as Allah (no beams of divine light, no hands, eyes, throne), or His attributes.
- Never depict prophets or messengers (Muhammad ﷺ, Musa, Isa, Ibrahim, Nuh, Yusuf, …), angels (no wings on people, no halos),
  the Companions, jinn, devils. Do not name them in prompts. Their stories are shown through places, nature, objects,
  crowds of ordinary unnamed people, or the outcome (e.g. "the sea split into two walls of water with a dry path" without any person leading).
- Paradise, Hell, the Day of Judgment and other unseen matters: do not render them literally. Show their effect on ordinary
  people in this world (hope, fear, regret, joy), or a worldly natural analogy named in the tafsir (gardens and rivers on earth,
  storm and fire on earth, a trembling earth). Keep it respectful and non-graphic.
- No sexual content, no nudity, modest clothing always (long sleeves; women in hijab). No gore, no blood, no wounds.
  Punishments and battles: show symbolically (scales of justice, witnesses standing solemnly, two ranks facing each other) — never injury.
- No text, letters, calligraphy or Quran pages inside the image.
- People are always generic and unnamed: "an Arab farmer", "a mother and her children", "a crowd of believers praying".

## How to write
- Follow the order of meaning in the ayah. One prompt per distinct visual moment (max 3). Use 1 for short ayat.
- 15–40 words each, concrete and visual: subject, action, setting, light, time of day, camera framing
  (wide establishing shot / medium shot / close-up on a face showing <emotion> / low angle / aerial view).
- Keep a character consistent across the shots of the same ayah (repeat the same short description).
- Ayat that only state Allah's names/attributes or abstract creed: choose a reverent natural image that matches the
  meaning (vast starry sky for greatness, rain reviving earth for mercy, a calm sunrise for guidance) — never a figure.
- Set "people": true only if the prompt contains people.

## Output format — one file per surah: public/data/shots/<surah>.json
A JSON array with exactly one entry per ayah, in order (entry i = ayah i+1):
[{"shots":[{"p":"wide shot of …","people":false},{"p":"close-up on the face of an Arab farmer …","people":true}]}, …]
Use valid JSON (double quotes, no trailing commas, no comments). Write the file with the Write tool.
