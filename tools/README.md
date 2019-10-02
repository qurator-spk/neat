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

## Usage:

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