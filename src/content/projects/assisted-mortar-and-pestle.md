---
title: Assisted Mortar and Pestle
tags: [Python, PyBullet, MuJoCo, WebAssembly]
dates: Jul 2026 – Present
order: 2
repo: https://github.com/rnk-src/mortar-and-pestle
sim:
  src: /demos/mortar-pestle/index.html
  poster: ../../assets/projects/assisted-mortar-and-pestle/poster.png
  alt: A yellow SO-101 robot arm presses a stone pestle in one mortar while a blue dummy pestle moves in a second mortar.
  size: about 9 MB
---

- Designing a real-time leader-follower system that lets users with limited strength teleoperate a robotic mortar and pestle through a lightweight dummy pestle
- Prototyping in PyBullet, driving a simulated Hugging Face LeRobot SO-101
- Ported the simulation to the browser with MuJoCo and Pyodide, so the same Python control code runs on this page
