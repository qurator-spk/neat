# TSV - Processing Tools

## Installation:

Setup virtual environment:
```
virtualenv --python=python3.6 venv
```

Activate virtual environment:
```
source venv/bin/activate
```

Upgrade pip:
```
pip install -U pip
```

Install package together with its dependencies in development mode:
```
pip install -e ./
```

## PAGE-XML to TSV Transformation:

Create a TSV file from OCR in PAGE-XML format (with word segmentation):

```
page2tsv PAGE1.xml PAGE.tsv --image-url=http://link-to-corresponding-image-1
```

In order to create a TSV file for multiple PAGE XML files just perform successive calls
of the tool using the same TSV file:

```
page2tsv PAGE1.xml PAGE.tsv --image-url=http://link-to-corresponding-image-1
page2tsv PAGE2.xml PAGE.tsv --image-url=http://link-to-corresponding-image-2
page2tsv PAGE3.xml PAGE.tsv --image-url=http://link-to-corresponding-image-3
page2tsv PAGE4.xml PAGE.tsv --image-url=http://link-to-corresponding-image-4
page2tsv PAGE5.xml PAGE.tsv --image-url=http://link-to-corresponding-image-5
...
...
...
```

A corresponding URL-mapping file can be obtained from:

```
extract-doc-links PAGE.tsv  PAGE-urls.tsv
```
By loading the annotated TSV as well as the url mapping file into 
ner.edith, you will be able to jump directly to the original image
where the full text has been extracted from.

---

## Processing of already existing TSV files:

Create a URL-annotated TSV file from an existing TSV file:

```
annotate-tsv enp_DE.tsv enp_DE-annotated.tsv
```
Create a corresponding URL-mapping file:

```
extract-doc-links enp_DE.tsv  enp_DE-urls.tsv
```

By loading the annotated TSV as well as the url mapping file into 
ner.edith, you will be able to jump directly to the original image
where the full text has been extracted from.

