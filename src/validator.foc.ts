import Logger, { Colors } from "fock-logger";

const quotes = ["\`", "\'", "\""];
const variableRegExp = /конст|пусть|const|let/;
const variableCreate = [
	"конст",
	"пусть"
];

class Validator {
	private readonly _file: string | undefined;
	private readonly _logger = new Logger("Validator");

	public constructor(file?: string) {
		this._file = file;
	}

	private readonly data = (file?: string): [string, string[], boolean] => {
		if (file) return [file, file.split("\r\n"), true];
		if (this._file) return [this._file, this._file.split("\r\n"), true];

		const fl = file || this._file;
		if (!fl) return ["", [], false];
		const lines = fl.split("\r\n");

		return [fl, lines, true];
	};

	private readonly PrintErrorFix = (text: string, error: string, file: string) => {
		const start = file.indexOf(`${text}`);
		const end = file.indexOf(`${error}`) + `${error}`.length;
		const err = file.slice(start, end);
		const e = file
			.replace(err, Colors.bgBrightMagenta + err + Colors.reset)
			.split("\r\n");

		this._logger.execute(
			"Линия с ошибкой выделена светлой маджентой",
			Colors.bgBrightMagenta
		);

		console.log();
		this._logger.execute("See your file:");
		console.log(e.map((l, i) => `${Number(i) + 1}. ${l}`).join("\r\n"));
		console.log();

		this._logger.execute(
			"Линия с ошибкой выделена светлой маджентой",
			Colors.bgBrightMagenta
		);
	};

	private readonly VariableValidator = (file: string, line: string, lineNumber: number) => {
		const matched = line.match(variableRegExp);

		if (!matched) {
			console.log(line.match(/\s*[А-Яа-яA-Za-z]+\s*=/));
		};
	}

	private readonly VariablesTypesValidator = (file: string, line: string, lineNumber: number) => {
		const matched = line.match(/:\s*[\W]+\s*=/);

		if (!matched) return true;

		const type = matched[0];

		for (const v of variableCreate) {
			const regexps = [
				new RegExp(`${v}`, "g"),
				new RegExp(`${v}\\s+[А-Яа-яA-Za-z]+:\\s*[А-Яа-яA-Za-z]+\\s*=`, "g")
			];

			if (!line.match(regexps[0]) && !line.match(/конст|пусть|const|let/g)) {
				this._logger.execute(`Линия ${lineNumber} не имеет объявление переменной`, Colors.red);
				this.PrintErrorFix(line, line, file);
				this._logger.execute(`Линия ${lineNumber} не имеет объявление переменной`, Colors.red);
				
				return false;	
			};
		};

		if (type) return true;

		return true;
	}

	private readonly QuotesValidator = (file: string, line: string, lineNumber: number): boolean => {
		for (const index in quotes) {
			const quote = quotes[index];
			const regexp = new RegExp(`[${quote}]`, "g");
			const lineQuotes = line.match(regexp);

			if (!lineQuotes) continue;

			if (lineQuotes.length % 2 === 1) {
				this._logger.execute(`Линия ${lineNumber} не имеет закрывающей скобки`, Colors.red);
				this.PrintErrorFix(line, line, file);
				this._logger.execute(`Линия ${lineNumber} не имеет закрывающей скобки`, Colors.red);
				
				return false;
			} else return true;
		};

		return true;
	};

	private readonly LineValidator = (file: string, lines: string[]): boolean => {
		for (const index in lines) {
			const line = lines[index];
			const lineNumber = Number(index) + 1;
			
			if (!!line.match(/\s+/g) && line.includes(";") && !line.match(/[\wА-Яа-я]+/g)) {
				this._logger.execute(`Линия ${lineNumber} содержит лишнюю ";"`, Colors.red);
				this.PrintErrorFix(line, line, file);
				this._logger.execute(`Линия ${lineNumber} содержит лишнюю ";"`, Colors.red);

				return false;
			};

			if (!(!!line.match(/\s+/g) || line === "" && !line.match(/\w+/g))) {
				if (line.match(/;/g)?.length !== 1 || !line.endsWith(";")) {
					this._logger.execute(`Линия ${lineNumber} не заканчивается на/не имеет/имеет больше ";"`, Colors.red);
					this.PrintErrorFix(line, line, file);
					this._logger.execute(`Линия ${lineNumber} не заканчивается на/не имеет/имеет больше ";"`, Colors.red);
	
					return false;
				};
			};

			if (!this.QuotesValidator(file, line, lineNumber)) return false;

			this.VariableValidator(file, line, lineNumber);

			this.VariablesTypesValidator(file, line, lineNumber);
		};

		return true;
	};

	private readonly Validator = (file: string, lines: string[]): boolean => {
		if (!this.LineValidator(file, lines)) return false;

		return true;
	};

	public init(fl?: string) {
		const [file, lines, isOk] = this.data(fl);

		if (!isOk) return false;

		return this.Validator(file, lines);
	}

	get logger(): Logger<"Validator"> {
		return this._logger;
	}
}

export default Validator;
