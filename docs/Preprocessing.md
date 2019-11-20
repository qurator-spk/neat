# Preprocessing

The preprocessing pipeline that is developed at the 
[Berlin State Library](http://staatsbibliothek-berlin.de/) 
comprises the following steps:

### Layout Analysis & Textline Extraction

Layout Analysis & Textline Extraction @[sbb_pixelwise_segmentation](https://github.com/qurator-spk/pixelwise_segmentation_SBB)

``INPUT ``: image file

``OUTPUT``: [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) file with bounding boxes for regions and text lines  

### OCR & Word Segmentation

OCR is based on [OCR-D](https://github.com/OCR-D)'s [ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr) which requires [Tesseract](https://github.com/tesseract-ocr/tesseract) **>= 4.1.0**. The [GT4HistOCR_2000000](https://ub-backup.bib.uni-mannheim.de/~stweil/ocrd-train/data/GT4HistOCR_2000000.traineddata) model, which is [trained](https://github.com/tesseract-ocr/tesstrain/wiki/GT4HistOCR) on the [GT4HistOCR](https://zenodo.org/record/1344132) corpus, is used. Further details are available in the [paper](https://arxiv.org/abs/1809.05501).

``INPUT ``: [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) file with bounding boxes for regions and text lines 

``OUTPUT``: [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) file with bounding boxes for words and the contained text

### Tokenization

A simple [Python tool](https://github.com/qurator-spk/neath/tree/master/tools) is used for the [transformation](https://github.com/qurator-spk/neath/tree/master/tools) of [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) to [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format).

``INPUT ``: [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) file with bounding boxes for words and the contained text 

``OUTPUT``: [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format) file in the desired format for [neath](https://github.com/qurator-spk/neath)

Some postprocessing is then applied to the derived [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format) file:
  * replace ``„`` and ``“`` with ``"``
  * detect sentence boundaries and mark them with a newline and leading ``0``
  * detect punctuation (``.``, ``,``, ``;``, ``:``, ``!``, ``?``) and split it from the adjacent string

### Named Entity Recognition

For Named Entity Recognition, a [BERT-Base](https://github.com/google-research/bert) model was trained for noisy OCR texts with historical spelling variation. [sbb_ner](https://github.com/qurator-spk/sbb_ner) is using a combination of unsupervised training on a large (~2.3m pages) [corpus of German OCR](https://zenodo.org/record/3257041) in combination with supervised training on a small (47k tokens) [annotated corpus](https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_DE.sbb.bio). Further details are available in the [paper](https://corpora.linguistik.uni-erlangen.de/data/konvens/proceedings/papers/KONVENS2019_paper_4.pdf).

``INPUT ``: [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format) file obtained after [Tokenization](https://github.com/qurator-spk/neath/blob/master/docs/Preprocessing.md#tokenization) and postprocessing

``OUTPUT``: [TSV](https://github.com/qurator-spk/neath/blob/master/docs/User_Guide.md#data-format) file with automatically recognized named entities added
