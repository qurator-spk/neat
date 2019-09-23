import re
import click
import pandas as pd
from io import StringIO


@click.command()
@click.argument('tsv-file', type=click.Path(exists=True), required=True, nargs=1)
def extract_document_links(tsv_file):

    parts = extract_doc_links(tsv_file)

    for part in parts:

        print(part['url'])


@click.command()
@click.argument('tsv-file', type=click.Path(exists=True), required=True, nargs=1)
@click.argument('annotated-tsv-file', type=click.Path(exists=False), required=True, nargs=1)
def annotate_tsv(tsv_file, annotated_tsv_file):

    parts = extract_doc_links(tsv_file)

    annotated_parts = []

    urls = []

    for part in parts:

        part_data = StringIO(part['header'] + part['text'])
        urls.append(part['url'])

        df = pd.read_csv(part_data, sep="\t", comment='#', quoting=3)

        df['url_id'] = len(annotated_parts)

        annotated_parts.append(df)

    df = pd.concat(annotated_parts)

    df.to_csv(annotated_tsv_file, sep="\t", quoting=3, index=False)


def extract_doc_links(tsv_file):

    parts = []

    header = None

    with open(tsv_file, 'r') as f:
        
        text = []
        url = None

        for line in f:

            if header is None:
                header = "\t".join(line.split()) + '\n'
                continue

            urls = [url for url in
                    re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', line)]

            if len(urls) > 0:
                if url is not None:
                    parts.append({"url": url, 'header': header, 'text': "".join(text)})
                    text = []

                url = urls[-1]
            else:
                if url is None:
                    continue

                line = '\t'.join(line.split())

                if line.count('\t') == 2:

                    line = "\t" + line

                if line.count('\t') == 3:

                    text.append(line + '\n')

                    continue

                if line.startswith('#'):
                    continue

                if len(line) == 0:
                    continue

                print('Line error: |', line, '|Number of Tabs: ', line.count('\t'))

        parts.append({"url": url, 'header': header, 'text': "".join(text)})

    return parts
