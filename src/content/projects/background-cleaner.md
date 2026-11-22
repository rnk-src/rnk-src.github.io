---
title: Background Cleaner
tags: [Python, PyTorch]
dates: Jul 2023 – Dec 2023
order: 4
repo: https://github.com/rnk-src/background-cleaner
image:
  mode: toggle
  label: One removed
  src: ../../assets/projects/background-cleaner/before-single.jpg
  alt: Before. Three people stand on a paved path in a park.
  after:
    src: ../../assets/projects/background-cleaner/after-single.jpg
    alt: After. Only the person on the right is removed and the other two remain.
  second:
    label: All removed
    src: ../../assets/projects/background-cleaner/before-all.jpg
    alt: Before. Three people stand on a paved path in a park.
    after:
      src: ../../assets/projects/background-cleaner/after-all.jpg
      alt: After. All three people are removed and the path and grass are filled in.
---

- Developed a CV model to remove humans from a picture and fill in the missing parts with generative AI
- 27% higher person-detection AP on heavily occluded people after fine-tuning a COCO-trained Mask R-CNN on OCHuman
- Used LaMa inpainting to regenerate the missing portions of the image
