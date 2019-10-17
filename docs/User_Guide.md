# User Guide
#### version 0.1

### 1. Introduction
* Basic outline - what is this and what can I use it for
* SoNAR-IDH project (https://sonar.fh-potsdam.de/)
* QURATOR project (https://qurator.ai/)

### 2. User Guide
#### Technical Requirements 
[ner.edith](https://github.com/cneud/ner.edith) runs locally as a pure HTML+JavaScript webpage in your web browser. No software needs to be installed, but JavaScript has to be enabled in the browser. Any fairly recent browser should work, but only Chrome and Firefox are tested.
#### Data input format   
Input data is required to follow the format used in the [GermEval2014 Named Entity Recognition Shared Task ](https://sites.google.com/site/germeval2014ner/data). Here, text is encoded as one token per line, with information provided in tab-separated columns. The first column contains either a #, which signals the source the sentence is cited from and the date it was retrieved, or the token number within the sentence. The second column contains the token. Name spans are encoded in the BIO-scheme. Outer spans are encoded in the third column, embedded spans in the fourth column.
#### Data preparation  
We also provide some [Python tools](https://github.com/cneud/ner.edith/tree/master/tools) that help with data wrangling.
#### Overview of Editor Features
  * Navigation
    * use mouse wheel to scroll up and down
    * use navigation `<<` and `>>` to move faster
    * show image snippet
  * Tagging
    * adding a tag
    * removing a tag
    * changing a tag
  * OCR correction
    * editing the token text
  * Segmentation correction
    * merging two tokens
    * splitting a token
#### Data export/Saving progress
The editor runs fully locally in the browser. Therefore it can not automatically save any changes you made to disk. You have to use the `Save Changes` button in order to so manually from time to time.

If your browser automatically saves all downloads to your `Downloads` folder, you might want to configure it so that it instead prompts you where to save.

Configuration option in Firefox:

![Screenshot](./../.screenshots/firefox.png)

Configuration option in Chrome:

![Screenshot](./../.screenshots/chrome.png)
### 3. FAQ
