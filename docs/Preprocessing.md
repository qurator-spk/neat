# Preprocessing

The preprocessing pipeline that is developed at the 
[Berlin State Library](http://staatsbibliothek-berlin.de/) 
comprises the following steps:

### Layout Analysis & Textline Extraction

Layout Analysis & Textline Extraction @[sbb_pixelwise_segmentation](https://github.com/qurator-spk/pixelwise_segmentation_SBB)

### OCR & Word Segmentation

OCR is based on [OCR-D](https://github.com/OCR-D)'s [ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr) which requires [Tesseract](https://github.com/tesseract-ocr/tesseract) **>= 4.1.0**. The [Fraktur_5000000](https://ub-backup.bib.uni-mannheim.de/~stweil/ocrd-train/data/Fraktur_5000000/) model, which is trained on [GT4HistOCR](https://github.com/tesseract-ocr/tesstrain/wiki/GT4HistOCR) is used. 
corpiu
The [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) produced by the [Layout Analysis & Textline Extraction](https://github.com/qurator-spk/neath/blob/master/docs/Preprocessing.md#layout-analysis--textline-extraction) is taken as input, and the output is [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) containing the text recognition results with absolute pixel coordinates describing bounding boxes for words. 

### Tokenization

### Named Entity Recognition

For Named Entity Recognition, a [BERT-Base](https://github.com/google-research/bert) model was trained. [sbb_ner](https://github.com/qurator-spk/sbb_ner) is using a combination of unsupervised training on a large (~2.3m pages) OCR corpus in combination with supervised training on a small (50k tokens) annotated corpus. Further details are available in the [paper](https://corpora.linguistik.uni-erlangen.de/data/konvens/proceedings/papers/KONVENS2019_paper_4.pdf).
