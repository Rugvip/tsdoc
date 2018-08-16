import { TextRange } from './TextRange';
import { Token } from './Token';
import { ParseError } from './ParseError';
import { DocComment, DocNode } from '../nodes';
import { TSDocParserConfiguration } from './TSDocParserConfiguration';

/**
 * An internal data structure that tracks all the state being built up by the various
 * parser stages.
 */
export class ParserContext {
  /**
   * The configuration that was provided for the TSDocParser.
   */
  public readonly configuration: TSDocParserConfiguration;

  /**
   * The `sourceRange` indicates the start and end of the original input that was parsed.
   */
  public readonly sourceRange: TextRange;

  /**
   * The text range starting from the opening `/**` and ending with
   * the closing `*\/` delimiter.
   */
  public commentRange: TextRange = TextRange.empty;

  /**
   * The text ranges corresponding to the lines of content inside the comment.
   */
  public lines: TextRange[] = [];

  /**
   * A complete list of all tokens that were extracted from the input lines.
   */
  public tokens: Token[] = [];

  /**
   * A diagnostic list of all DocNode objects that were encountered during the first pass
   * of the parser, in the order that they originally appeared in the input, with no gaps
   * or overlap of token sequences.
   *
   * This linearity may be lost when the nodes are assembled into a DocComment, due to:
   * - reordering/grouping of sections
   * - deleting block tags that were moved to the ModifierTagSet
   * - pruning of whitespace
   */
  public verbatimNodes: DocNode[];

  /**
   * The parsed doc comment object.  This is the primary output of the parser.
   */
  public readonly docComment: DocComment;

  /**
   * If any errors occurred during parsing, they are returned in this list.
   */
  public readonly parseErrors: ParseError[] = [];

  public constructor(configuration: TSDocParserConfiguration, sourceRange: TextRange) {
    this.configuration = configuration;
    this.sourceRange = sourceRange;

    this.verbatimNodes = [];

    this.docComment = new DocComment({ parserContext: this });
  }

  public addError(range: TextRange, message: string, pos: number, end?: number): void {
    if (!end) {
      if (pos + 1 <= range.buffer.length) {
        end = pos + 1;
      } else {
        end = pos;
      }
    }
    this.parseErrors.push(
      new ParseError(message, range.getNewRange(pos, end))
    );
  }
}
