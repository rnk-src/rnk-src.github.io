---
title: Background Cleaner
tags: [Python, PyTorch]
dates: Jul 2023 – Dec 2023
order: 3
repo: https://github.com/rnk-src/background-cleaner
image:
  mode: toggle
  label: All removed
  src: ../../assets/projects/background-cleaner/compare-all.jpg
  alt: Before and after. Three people stand on a paved path in a park. In the after image all three are removed and the path and grass are filled in.
  second:
    label: One removed
    src: ../../assets/projects/background-cleaner/compare-single.jpg
    alt: Before and after. Three people stand on a paved path. In the after image only the person on the right is removed and the other two remain.
---

- Developed a CV model to remove humans from a picture and fill in the missing parts with generative AI
- Built a pipeline to fine-tune a COCO-trained segmentation model on the OCHuman dataset
- Used LaMa inpainting to regenerate the missing portions of the image
