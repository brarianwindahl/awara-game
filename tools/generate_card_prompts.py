#!/usr/bin/env python3
"""
T-037: Generate image-generation prompts for all AWARA cards.

Reads agents.json, matrices.json, agent_matrix_map.json
Outputs data/card_prompts.json with structured prompts for each card.

Usage:
    python tools/generate_card_prompts.py
"""

import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")

ELEMENT_VISUALS = {
    "Огонь": "flames, embers, molten gold, solar corona, radiant heat haze",
    "Вода": "flowing water, moonlit waves, deep ocean currents, mist, rain drops",
    "Земля": "ancient stone, roots, crystals, mountain peaks, terracotta, fertile soil",
    "Воздух": "swirling winds, feathers, clouds, translucent veils, breath of light",
    "Эфир": "starfield, cosmic nebula, fractal geometry, iridescent void, quantum light",
}

GUNA_STYLE = {
    "саттва": "serene, luminous, harmonious, balanced light, ethereal glow",
    "раджас": "dynamic, passionate, energetic, vivid contrasts, motion blur",
    "тамас": "mysterious, deep, shadowy, ancient, cosmic darkness with pinpoints of light",
}

STYLE_BASE = (
    "digital painting, card art, mystical esoteric style, "
    "ornate border frame, portrait orientation, "
    "highly detailed, 4k, atmospheric lighting"
)


def load_json(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


def build_prompts():
    agents = load_json("agents.json")
    matrices = load_json("matrices.json")
    agent_map = load_json("agent_matrix_map.json")

    agents_by_id = {a["id"]: a for a in agents}
    matrices_by_id = {m["id"]: m for m in matrices}

    prompts = []

    for entry in agent_map:
        agent = agents_by_id.get(entry["agent_id"])
        matrix = matrices_by_id.get(entry["matrix_id"])
        if not agent or not matrix:
            continue

        element = agent.get("element", "Эфир")
        guna = agent.get("guna", "саттва")
        cultural_name = entry.get("cultural_name", agent["name"])
        visual_code = matrix.get("visual_code", "")

        element_vis = ELEMENT_VISUALS.get(element, ELEMENT_VISUALS["Эфир"])
        guna_vis = GUNA_STYLE.get(guna, GUNA_STYLE["саттва"])

        prompt = (
            f"A mystical card depicting {cultural_name}, "
            f"manifestation of {agent['name']} in the {matrix['name']} tradition. "
            f"Domain: {agent['domain']}. "
            f"Element: {element} — {element_vis}. "
            f"Visual motifs: {visual_code}. "
            f"Mood: {guna_vis}. "
            f"{STYLE_BASE}"
        )

        negative = (
            "text, watermark, signature, blurry, low quality, "
            "modern clothing, photography, realistic face, "
            "deformed, ugly, nsfw"
        )

        card_id = f"{agent['slug']}__{matrix['slug']}"

        prompts.append({
            "card_id": card_id,
            "agent_slug": agent["slug"],
            "agent_name": agent["name"],
            "matrix_slug": matrix["slug"],
            "matrix_name": matrix["name"],
            "cultural_name": cultural_name,
            "element": element,
            "domain": agent["domain"],
            "prompt": prompt,
            "negative_prompt": negative,
            "image_path": f"cards/{card_id}.webp",
        })

    return prompts


def main():
    prompts = build_prompts()
    out_path = os.path.join(DATA, "card_prompts.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(prompts)} card prompts -> {out_path}")


if __name__ == "__main__":
    main()
