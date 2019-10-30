import sys
import codecs
import xml.etree.ElementTree as ET

sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
tree = ET.parse(sys.argv[1])
xmlns = tree.getroot().tag.split('}')[0].strip('{')
for words in tree.findall('.//{%s}Word' % xmlns):
	for word in words.findall('.//{%s}Unicode' % xmlns):
		text = word.text
		for coords in words.findall('.//{%s}Coords' % xmlns):
			sys.stdout.write('0\t'+text+'\tO\tO\t'+coords.attrib['points']+'\n')