---
title: Navigating Worm
tags: [Python, MuJoCo, Stable-Baselines3]
dates: Nov 2026 – Present
order: 2
repo: https://github.com/rnk-src/navigating-worm
---

- Training a terrain-aware PPO policy in MuJoCo for a servo-driven worm robot, raising speed 35–43% across stone, grass and sand over a terrain-blind baseline
- Designing sensor-realistic observations (camera terrain class, range-sensor heights) with noise models and a four-level terrain curriculum, plus randomized friction, mass and servo dynamics modeled on the Feetech SCS0009
- Planning routes with A* over a terrain cost map around rocks, ditches and slopes, replanning when the worm gets stuck
