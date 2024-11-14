import Logger, { Colors } from "fock-logger";

class Validator {
    private readonly _file: string | undefined;
    private readonly _logger = new Logger("Validator");
    
    public constructor(file?: string) {
        this._file = file;
    };

    private readonly data = (file?: string): [string, string[], boolean] => {
        if (file)
            return [file, file.split("\r\n"), true];

        if (this._file)
            return [this._file, this._file.split("\r\n"), true];

        const fl = file || this._file;

        if (!fl)
            return ["", [], false];

        const lines = fl.split("\r\n");

        return [ fl, lines, true ];
    };

    private readonly PrintErrorFix = (text: string, error: string, file: string) => {
        const start = file.indexOf(`${text}`);
		const end = file.indexOf(`${error}`) + `${error}`.length;
		const err = file.slice(start, end);
        const e = file.replace(err, Colors.bgBrightMagenta + err + Colors.reset).split("\r\n");

		this._logger.execute("Линия с ошибкой выделена светлой маджентой", Colors.bgBrightMagenta);

        console.log();
		this._logger.execute("See your file:");
		console.log(e.map((l, i) => `${Number(i)+1}. ${l}`).join("\r\n"));
        console.log();

		this._logger.execute("Линия с ошибкой выделена светлой маджентой", Colors.bgBrightMagenta);
    }

    private readonly LineValidator = (file: string, lines: string[]): boolean => {
        for(const index in lines) {
            const line = lines[index];
            const lineNumber = Number(index) + 1;

            if (!line.includes(";")) {
                this._logger.execute(`Линия ${lineNumber} не имеет ";"`, Colors.red);
                this.PrintErrorFix(line, line, file);

                return false;
            }
        };

        return true;
    };

    private readonly Validator = (file: string, lines: string[]): boolean => {
        if (!this.LineValidator(file, lines))
            return false;

        return true;
    };

    public init(fl?: string) {
        const [ file, lines, isOk ] = this.data(fl);

        if (!isOk) return false;

        return this.Validator(file, lines);
    };

    get logger(): Logger<"Validator"> {
        return this._logger;
    }
};

export default Validator;
