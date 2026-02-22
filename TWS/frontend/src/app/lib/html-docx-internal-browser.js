/**
 * Browser shim for html-docx-js/build/internal.js
 * Inlines the XML assets so we don't need Node's fs in the bundle.
 */
const documentTemplate = require('html-docx-js/build/templates/document');
const utils = require('html-docx-js/build/utils');
const _ = { merge: require('lodash.merge') };

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType=
    "application/vnd.openxmlformats-package.relationships+xml" />
  <Override PartName="/word/document.xml" ContentType=
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/afchunk.mht" ContentType="message/rfc822"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship
      Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
      Target="/word/document.xml" Id="R09c83fafc067488e" />
</Relationships>`;

const DOCUMENT_XML_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk"
    Target="/word/afchunk.mht" Id="htmlChunk" />
</Relationships>`;

module.exports = {
  generateDocument(zip) {
    const buffer = zip.generate({ type: 'arraybuffer' });
    if (typeof Blob !== 'undefined') {
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }
    if (typeof Buffer !== 'undefined') {
      return new Buffer(new Uint8Array(buffer));
    }
    throw new Error('Neither Blob nor Buffer are accessible in this environment.');
  },
  renderDocumentFile(documentOptions) {
    if (documentOptions == null) documentOptions = {};
    const templateData = _.merge(
      {
        margins: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
          header: 720,
          footer: 720,
          gutter: 0
        }
      },
      documentOptions.orientation === 'landscape'
        ? { height: 12240, width: 15840, orient: 'landscape' }
        : { width: 12240, height: 15840, orient: 'portrait' },
      { margins: documentOptions.margins }
    );
    return documentTemplate(templateData);
  },
  addFiles(zip, htmlSource, documentOptions) {
    zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
    zip.folder('_rels').file('.rels', RELS_XML);
    zip
      .folder('word')
      .file('document.xml', this.renderDocumentFile(documentOptions))
      .file('afchunk.mht', utils.getMHTdocument(htmlSource))
      .folder('_rels')
      .file('document.xml.rels', DOCUMENT_XML_RELS);
    return zip;
  }
};
