# Preprocessing

The preprocessing pipeline that is developed at the 
[Berlin State Library](http://staatsbibliothek-berlin.de/) 
comprises the following steps:
- textline extraction @[sbb_pixelwise_segmentation](https://github.com/qurator-spk/pixelwise_segmentation_SBB)
- word segmentation @[ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr)
- OCR @[ocrd_calamari](https://github.com/qurator-spk/ocrd_calamari)
- Tokenization
- Pretagging @[sbb_ner](https://github.com/qurator-spk/sbb_ner)