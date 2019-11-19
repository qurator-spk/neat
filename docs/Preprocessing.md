# Preprocessing

The preprocessing pipeline that is developed at the 
[Berlin State Library](http://staatsbibliothek-berlin.de/) 
comprises the following steps:

### Layout Analysis & Textline Extraction

Layout Analysis & Textline Extraction @[sbb_pixelwise_segmentation](https://github.com/qurator-spk/pixelwise_segmentation_SBB)

### OCR & Word Segmentation

OCR is based on [OCR-D](https://github.com/OCR-D)'s [ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr) which requires [Tesseract](https://github.com/tesseract-ocr/tesseract) **>= 4.1.0**. The [Fraktur_5000000](https://ub-backup.bib.uni-mannheim.de/~stweil/ocrd-train/data/Fraktur_5000000/) model, which is trained on [GT4HistOCR](https://github.com/tesseract-ocr/tesstrain/wiki/GT4HistOCR) is used. 

### Tokenization

### Named Entity Recognition

For Named Entity Recognition, a [BERT-Base](https://github.com/google-research/bert) model was trained for noisy OCR texts with historical spelling variation. 

[sbb_ner](https://github.com/qurator-spk/sbb_ner) is using a combination of unsupervised training on a large (~2.3m pages) [corpus of German OCR](https://zenodo.org/record/3257041) from the Digital Collections of the Berlin State Library in combination with supervised training on a small (47k tokens) [annotated corpus](https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_DE.sbb.bio) of OCR from digitized historical newspapers of the Berlin State Library. Further details are available in the [paper](https://corpora.linguistik.uni-erlangen.de/data/konvens/proceedings/papers/KONVENS2019_paper_4.pdf).
