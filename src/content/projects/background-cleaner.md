---
title: Background Cleaner
tags: [Python, PyTorch]
dates: Jul 2023 – Dec 2023
order: 3
repo: https://github.com/rnk-src/background-cleaner
image:
  mode: toggle
  label: All removed
  src: ../../assets/projects/background-cleaner/before-all.jpg
  alt: Before. Three people stand on a paved path in a park.
  after:
    src: ../../assets/projects/background-cleaner/after-all.jpg
    alt: After. All three people are removed and the path and grass are filled in.
  second:
    label: One removed
    src: ../../assets/projects/background-cleaner/before-single.jpg
    alt: Before. Three people stand on a paved path in a park.
    after:
      src: ../../assets/projects/background-cleaner/after-single.jpg
      alt: After. Only the person on the right is removed and the other two remain.
---

- Developed a CV model to remove humans from a picture and fill in the missing parts with generative AI
- Built a pipeline to fine-tune a COCO-trained segmentation model on the OCHuman dataset
- Used LaMa inpainting to regenerate the missing portions of the image
