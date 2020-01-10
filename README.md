# neath: named entity annotation tool
#### version 0.1
---
![Screenshot](https://user-images.githubusercontent.com/952378/72167036-ad2c6680-33ca-11ea-980f-5859e5155877.png)

# User Guide

### Table of contents
[1. Introduction](https://github.com/qurator-spk/neath/blob/master/README.md#1-introduction) 

[2. User Guide](https://github.com/qurator-spk/neath/blob/master/README.md#2-user-guide)

&nbsp;&nbsp;&nbsp;[2.1 Technical requirements](https://github.com/qurator-spk/neath/blob/master/README.md#21-technical-requirements) 
    
&nbsp;&nbsp;&nbsp;[2.2 Data format](https://github.com/qurator-spk/neath/blob/master/README.md#22-data-format)
    
&nbsp;&nbsp;&nbsp;[2.3 Data preparation](https://github.com/qurator-spk/neath/blob/master/README.md#23-data-preparation)
    
&nbsp;&nbsp;&nbsp;[2.4 Provenance](https://github.com/qurator-spk/neath/blob/master/README.md#24-provenance)
    
&nbsp;&nbsp;&nbsp;[2.5 Keyboard navigation](https://github.com/qurator-spk/neath/blob/master/README.md#25-keyboard-navigation)
    
&nbsp;&nbsp;&nbsp;[2.6 Mouse navigation](https://github.com/qurator-spk/neath/blob/master/README.md#26-mouse-navigation)
    
&nbsp;&nbsp;&nbsp;[2.7 Image support](https://github.com/qurator-spk/neath/blob/master/README.md#27-image-support)
    
&nbsp;&nbsp;&nbsp;[2.8 Saving progress](https://github.com/qurator-spk/neath/blob/master/README.md#28-saving-progress)

[3. Annotation Guidelines](https://github.com/qurator-spk/neath/blob/master/README.md#3-annotation-guidelines)

### 1. Introduction
[neath](https://github.com/qurator-spk/neath) is a simple, browser-based tool for editing and annotating text with named entities to produce a corpus for training/testing/evaluation. It can be used to add or correct named entity BIO-tags in a TSV file and to correct the token text or tokenization (e.g. due to OCR/segmentation errors). 

[neath](https://github.com/qurator-spk/neath) is developed at the [Berlin State Library](https://staatsbibliothek-berlin.de/) for data annotation in the context of the [SoNAR-IDH](https://sonar.fh-potsdam.de/) project and the [QURATOR](https://qurator.ai/) project.

### 2. User Guide

#### 2.1 Technical Requirements 
[neath](https://github.com/qurator-spk/neath) runs locally as a pure HTML+JavaScript webpage in your web browser. No software needs to be installed, but JavaScript has to be enabled in the browser. Any fairly recent browser should work, but only Chrome and Firefox are tested.

#### 2.2 Data format   
The data format is based on the format used in the [GermEval2014 Named Entity Recognition Shared Task](https://sites.google.com/site/germeval2014ner/data). Text is encoded as one token per line, with name spans encoded in the BIO-scheme, provided as tab-separated values:
* the first column contains either a `#`, which signals the source the sentence is cited from, or 
* the token position within the sentence ``>=1``
* sentence boundaries are indicated by ``0``
* the second column contains the token ``text`` 
* outer entity spans are encoded in the third column ``NE-TAG``
* embedded entity spans are encoded in the fourth column ``NE-EMB`` 

Example (simple):
```tsv
No.	TOKEN	NE-TAG	NE-EMB
# https://example.url
1	Donnerstag	O	O
2	,	O	O
3	1	O	O	
4	.	O	O	
5	Januar	O	O	
6	.	O	O		
0		O	O
1	Berliner	B-ORG	B-LOC	
2	Tageblatt	I-ORG	O	
3	.	O	O		
0		O	O
1	Nr	O	O	
2	.	O	O		
3	1	O	O	
4	.	O	O	
0		O	O
1	Seite	O	O
2	3	O	O
```

For our purposes we extend this format by adding
* a fifth column for an ``ID`` for the outer ``NE-TAG`` from an authority file (in this case, the [GND](https://www.dnb.de/EN/Professionell/Standardisierung/GND/gnd_node.html) is used) 
* column six for use as a variable ``url_id`` (see [Image Support](https://github.com/qurator-spk/neath/blob/master/README.md#27-image-support) for further details)
* finally, columns 7+ are used for storing ``left,right,top,bottom`` pixel coordinates for facsimile snippets 

Example (full):
```tsv
No.	TOKEN	NE-TAG	NE-EMB	GND-ID	url_id	left,right,top,bottom
# https://example.url/iiif/left,right,top,bottom/full/0/default.jpg
1	Donnerstag	O	O	-	0	174,352,358,390
2	,	O	O	-	0	174,352,358,390	
3	1	O	O	-	0	367,392,361,381
4	.	O	O	-	0	370,397,352,379
5	Januar	O	O	-	0	406,518,358,386
6	.	O	O	-	0	406,518,358,386	
0
1	Berliner	B-ORG	B-LOC	1086206452	0	816,984,358,388
2	Tageblatt	I-ORG	O	1086206452	0	1005,1208,360,387
3	.	O	O	-	0	1005,1208,360,387
0
1	Nr	O	O	-	0	1237,1288,360,382
2	.	O	O	-	0	1237,1288,360,382
3	1	O	O	-	0	1304,1326,361,381
4	.	O	O	-	0	1304,1326,361,381
0
1	Seite	O	O	-	0	1837,1926,361,392
2	3	O	O	-	0	1939,1967,364,385
```

#### 2.3 Data preparation  
The source data that is used for annotation are OCR results in [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) format. We provide a [Python tool](https://github.com/qurator-spk/page2tsv) that supports the transformation of [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) OCR files into the [TSV format](https://github.com/qurator-spk/neath/blob/master/README.md#22-data-format) required for use with [neath](https://github.com/qurator-spk/neath).

#### 2.4 Provenance
The processing pipeline applied at the Berlin State Library comprises the follows steps: 

1. Layout Analysis & Textline Extraction       
Layout Analysis & Textline Extraction @[sbb_textline_detector](https://github.com/qurator-spk/sbb_textline_detector)
2. OCR & Word Segmentation    
OCR is based on [OCR-D](https://github.com/OCR-D)'s [ocrd_tesserocr](https://github.com/OCR-D/ocrd_tesserocr) which requires [Tesseract](https://github.com/tesseract-ocr/tesseract) **>= 4.1.0**. The [GT4HistOCR_2000000](https://ub-backup.bib.uni-mannheim.de/~stweil/ocrd-train/data/GT4HistOCR_2000000.traineddata) model, which is [trained](https://github.com/tesseract-ocr/tesstrain/wiki/GT4HistOCR) on the [GT4HistOCR](https://zenodo.org/record/1344132) corpus, is used. Further details are available in the [paper](https://arxiv.org/abs/1809.05501).
3. TSV Transformation   
A simple [Python tool](https://github.com/qurator-spk/page2tsv) is used for the transformation of the OCR results in [PAGE-XML](https://github.com/PRImA-Research-Lab/PAGE-XML) to [TSV](https://github.com/qurator-spk/neath/blob/master/docs/README.md#22-data-format).
4. Tokenization    
For tokenization, [SoMaJo](https://github.com/tsproisl/SoMaJo) is used.
5. Named Entity Recognition    
For Named Entity Recognition, a [BERT-Base](https://github.com/google-research/bert) model was trained for noisy OCR texts with historical spelling variation. [sbb_ner](https://github.com/qurator-spk/sbb_ner) is using a combination of unsupervised training on a large (~2.3m pages) [corpus of German OCR](https://zenodo.org/record/3257041) in combination with supervised training on a small (47k tokens) [annotated corpus](https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_DE.sbb.bio). Further details are available in the [paper](https://corpora.linguistik.uni-erlangen.de/data/konvens/proceedings/papers/KONVENS2019_paper_4.pdf).


#### 2.5 Keyboard-Navigation

| Key Combination|      Action      |
|:---------|:-------------------------------------------|
| Left     |  Move one cell left                        |
| Right    |  Move one cell right                       |
| Up       |  Move one row up                           |
| Down     |  Move one row down                         |
| PageDown |  Move page down                            |
| PageUp   |  Move page up                              |
| Crtl+Up  |  Move entire table one row up              |
| Crtl+Down|  Move entire table one row down            |
|----------|--------------------------------------------|
| s  t     |  Start new sentence in current row         |
| m  e     |  Merge current row with row above          |
| s  p     |  Create copy of current row                |
| d  l     |  Delete current row                        |
|----------|--------------------------------------------|
| backspace|  Set NE-TAG / NE-EMB to "O"                |
| b  p     |  Set NE-TAG / NE-EMB to "B-PER"            |
| b  l     |  Set NE-TAG / NE-EMB to "B-LOC"            |
| b  o     |  Set NE-TAG / NE-EMB to "B-ORG"            |
| b  w     |  Set NE-TAG / NE-EMB to "B-WORK"           |
| b  c     |  Set NE-TAG / NE-EMB to "B-CONF"           |
| b  e     |  Set NE-TAG / NE-EMB to "B-EVT"            |
| b  t     |  Set NE-TAG / NE-EMB to "B-TODO"           |
| i  p     |  Set NE-TAG / NE-EMB to "I-PER"            |
| i  l     |  Set NE-TAG / NE-EMB to "I-LOC"            |
| i  o     |  Set NE-TAG / NE-EMB to "I-ORG"            |
| i  w     |  Set NE-TAG / NE-EMB to "I-WORK"           |
| i  c     |  Set NE-TAG / NE-EMB to "I-CONF"           | 
| i  e     |  Set NE-TAG / NE-EMB to "I-EVT"            |
| i  t     |  Set NE-TAG / NE-EMB to "I-TODO"           |
|----------|--------------------------------------------|
| enter    | Edit TOKEN or GND-ID                       |
| esc      | Close TOKEN or GND-ID edit field without   |
|          | application of changes.                    |
|----------|--------------------------------------------|
| l a      | add one display row                        |
| l r      | remove on display row (minimum is 5)       |
|----------|--------------------------------------------|

#### 2.6 Mouse-Navigation
* use mouse wheel to scroll up and down

* left-click `<<` and `>>` to move 15 rows up or down

* left-click `O` in the `NE-TAG` or `NE-EMB` columns to open the drop-down menu and select any of the supported NE-Tags to tag a token or change an existing tag to another one

* left-click a tag in the `NE-TAG` or `NE-EMB` columns and subsequently select `O` to remove a wrong tag

* left-click a token in the `TOKEN` column to edit/correct the text content

* left-click the `POSITION` of a row and select `split` from the drop-down menu to create a copy of the current row

* left-click the `POSITION` of a row and select `merge` from the drop-down menu to merge the current row with the row above

* left-click the `POSITION` of a row and select `start-sentence` from the drop-down menu to start a new sentence

#### 2.7 Image Support
Provided facsimile images are available online via the [iiif.io](https://iiif.io/) Image API, [neath](https://github.com/qurator-spk/neath) supports the embedding of facsimile snippets into its interface to help with data annotation and correction. 
This further requires that OCR with word segmentation is applied to the image to determine bounding boxes for tokens. 

The iiif-image-url contained in the source ``#`` can then be used as a replacement for ``url_id`` in combination with the token bounding boxes as ``left,right,top,bottom`` to obtain the facsimile snippet url and display the image in the leftmost column. Clicking on the facsimile snippet opens up a new tab with a larger context.

#### 2.8 Saving progress
[neath](https://github.com/qurator-spk/neath) runs fully locally in the browser. Therefore it can not automatically save any changes you made to disk. You have to use the `Save Changes` button in order to so manually from time to time. If your browser automatically saves all downloads to your `Downloads` folder, you might want to configure it so that it instead prompts you where to save.

### 3. Annotation Guidelines
The most recent version of the [Annotation Guidelines](https://github.com/qurator-spk/neath/blob/master/Annotation_Guidelines.pdf) is included in this repository. 
