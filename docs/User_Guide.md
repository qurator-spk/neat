# User Guide
#### version 0.1

### 1. Introduction
[neath](https://github.com/qurator-spk/neath) is a simple, browser-based tool for editing and annotating text with named entities to produce a corpus for training/testing/evaluation. It can be used to either add or correct named entity BIO-tags in a TSV file and to correct the token text and or segmentation (e.g. due to OCR errors). [neath](https://github.com/qurator-spk/neath) is developed at the [Berlin State Library](http://staatsbibliothek-berlin.de/) for data annotation in the context of the [SoNAR-IDH](https://sonar.fh-potsdam.de/) project and the [QURATOR](https://qurator.ai/) project.

### 2. User Guide
#### Technical Requirements 
[neath](https://github.com/qurator-spk/neath) runs locally as a pure HTML+JavaScript webpage in your web browser. No software needs to be installed, but JavaScript has to be enabled in the browser. Any fairly recent browser should work, but only Chrome and Firefox are tested.
#### Data input format   
The input data format is based on the format used in the [GermEval2014 Named Entity Recognition Shared Task](https://sites.google.com/site/germeval2014ner/data). Here, text is encoded as one token per line, with information provided in tab-separated columns. The first column contains either a #, which signals the source the sentence is cited from and the date it was retrieved, or the token number within the sentence. The second column contains the token. Name spans are encoded in the BIO-scheme. Outer spans are encoded in the third column, embedded spans in the fourth column.

Furthermore, we add a fifth column for an identifier from an authority file (in this case, the [GND](https://www.dnb.de/EN/Professionell/Standardisierung/GND/gnd_node.html) is used). Finally, columns six to nine are used for storing pixel coordinates for the facsimile snippets. 
#### Data preparation  
We also provide some [Python tools](https://github.com/qurator-spk/neath/tree/master/tools) that help with data wrangling.
#### Navigation
* use mouse wheel to scroll up and down
* use navigation `<<` and `>>` to move faster
* show image snippet
#### Tagging
* adding a tag
* removing a tag
* changing a tag
#### OCR correction
* editing the token text
#### Segmentation correction
* merging two tokens
* splitting a token
#### Data export/Saving progress
[neath](https://github.com/qurator-spk/neath) runs fully locally in the browser. Therefore it can not automatically save any changes you made to disk. You have to use the `Save Changes` button in order to so manually from time to time.

If your browser automatically saves all downloads to your `Downloads` folder, you might want to configure it so that it instead prompts you where to save.

Configuration option in Firefox:

![Screenshot](./../assets/firefox.png)

Configuration option in Chrome:

![Screenshot](./../assets/chrome.png)
### 3. FAQ
