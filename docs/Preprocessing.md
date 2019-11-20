# Preprocessing

The preprocessing pipeline that is developed at the 
[Berlin State Library](http://staatsbibliothek-berlin.de/) 
comprises the following steps:

### Layout Analysis & Textline Extraction

Layout Analysis & Textline Extraction @[sbb_pixelwise_segmentation](https://github.com/qurator-spk/pixelwise_segmentation_SBB)

### OCR & Word Segmentation

OCR is based on [OCR-D](https://github.com/OCR-D)'s [ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr) which requires [Tesseract](https://github.com/tesseract-ocr/tesseract) **>= 4.1.0**. The [GT4HistOCR_2000000](https://ub-backup.bib.uni-mannheim.de/~stweil/ocrd-train/data/GT4HistOCR_2000000.traineddata) model, which is [trained](https://github.com/tesseract-ocr/tesstrain/wiki/GT4HistOCR) on the [GT4HistOCR](https://zenodo.org/record/1344132) corpus, is used. Further details are available in the [paper](https://arxiv.org/abs/1809.05501).

### Tokenization

* [Transformation](https://github.com/qurator-spk/neath/tree/master/tools) of [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) to [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format).
* Postprocessing:
  * replace ``„`` and ``“`` with ``"``
  * sentence boundaries
  * punctuation

### Named Entity Recognition

For Named Entity Recognition, a [BERT-Base](https://github.com/google-research/bert) model was trained for noisy OCR texts with historical spelling variation. [sbb_ner](https://github.com/qurator-spk/sbb_ner) is using a combination of unsupervised training on a large (~2.3m pages) [corpus of German OCR](https://zenodo.org/record/3257041) in combination with supervised training on a small (47k tokens) [annotated corpus](https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_DE.sbb.bio). Further details are available in the [paper](https://corpora.linguistik.uni-erlangen.de/data/konvens/proceedings/papers/KONVENS2019_paper_4.pdf).
