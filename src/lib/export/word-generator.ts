import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
} from 'docx'
import { FormattedDebateData, formatDate } from './transcript-formatter'

export async function generateWord(debateData: FormattedDebateData): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...generateHeader(debateData),
          ...generateMetadata(debateData),
          ...generateParticipants(debateData),
          new Paragraph({ text: '' }), // Spacer
          ...parseMarkdownToDocx(debateData.transcript),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

function generateHeader(debateData: FormattedDebateData): Paragraph[] {
  return [
    new Paragraph({
      text: debateData.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: debateData.topic,
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    }),
    ...(debateData.description
      ? [
          new Paragraph({
            text: debateData.description,
            spacing: { after: 300 },
          }),
        ]
      : []),
  ]
}

function generateMetadata(debateData: FormattedDebateData): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Format: ',
          bold: true,
        }),
        new TextRun({
          text: debateData.formatName,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated: ',
          bold: true,
        }),
        new TextRun({
          text: formatDate(new Date()),
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Last Updated: ',
          bold: true,
        }),
        new TextRun({
          text: formatDate(debateData.updatedAt),
        }),
      ],
      spacing: { after: 300 },
    }),
  ]
}

function generateParticipants(debateData: FormattedDebateData): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Participants',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    }),
    ...debateData.participants.map(
      (p) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${p.name}`,
              bold: true,
            }),
            new TextRun({
              text: ` (${p.role})`,
              italics: true,
            }),
          ],
          spacing: { after: 100 },
          bullet: {
            level: 0,
          },
        })
    ),
    new Paragraph({
      text: '',
      spacing: { after: 300 },
    }),
  ]
}

function parseMarkdownToDocx(markdown: string): Paragraph[] {
  const lines = markdown.split('\n')
  const paragraphs: Paragraph[] = []

  let inCodeBlock = false
  let codeBlockContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeBlockContent.join('\n'),
                font: 'Courier New',
                size: 20,
              }),
            ],
            spacing: { before: 100, after: 100 },
            shading: {
              fill: 'f3f4f6',
            },
          })
        )
        codeBlockContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Skip empty lines
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '' }))
      continue
    }

    // Handle headings
    if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3).trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      )
      continue
    }

    if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(4).trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 150 },
        })
      )
      continue
    }

    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2).trim(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      )
      continue
    }

    // Handle horizontal rules
    if (line.trim() === '---' || line.trim() === '***') {
      paragraphs.push(
        new Paragraph({
          border: {
            bottom: {
              color: 'e5e7eb',
              space: 1,
              value: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 200, after: 200 },
        })
      )
      continue
    }

    // Handle list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          children: parseInlineMarkdown(line.substring(2).trim()),
          bullet: {
            level: 0,
          },
          spacing: { after: 100 },
        })
      )
      continue
    }

    // Regular paragraphs with inline markdown
    paragraphs.push(
      new Paragraph({
        children: parseInlineMarkdown(line),
        spacing: { after: 150 },
      })
    )
  }

  return paragraphs
}

function parseInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = []
  let currentPos = 0

  // Pattern to match **bold**, *italic*, `code`, and regular text
  const pattern = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  let match

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentPos) {
      runs.push(
        new TextRun({
          text: text.substring(currentPos, match.index),
        })
      )
    }

    const matched = match[0]
    if (matched.startsWith('**') && matched.endsWith('**')) {
      // Bold text
      runs.push(
        new TextRun({
          text: matched.substring(2, matched.length - 2),
          bold: true,
        })
      )
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      // Italic text
      runs.push(
        new TextRun({
          text: matched.substring(1, matched.length - 1),
          italics: true,
        })
      )
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      // Code
      runs.push(
        new TextRun({
          text: matched.substring(1, matched.length - 1),
          font: 'Courier New',
          shading: {
            fill: 'f3f4f6',
          },
        })
      )
    }

    currentPos = match.index + matched.length
  }

  // Add remaining text
  if (currentPos < text.length) {
    runs.push(
      new TextRun({
        text: text.substring(currentPos),
      })
    )
  }

  return runs.length > 0 ? runs : [new TextRun({ text })]
}
