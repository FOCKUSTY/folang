import Logger from 'fock-logger';

import path from 'path';
import fs from 'fs';

import Validator from './validator.foc';
import config from '../config.json';

class Reader {
    private readonly logger = new Logger("Reader");
    private readonly _path: string = path.join(config.path || "./");
    private readonly validator = new Validator();

    public constructor() {
        this.init();
    };

    private readonly isFolder = (p: string): boolean => {
        const parsed = path.parse(path.join(p));

        return parsed.ext === "";
    };

    private readonly ReadFile = (p: string) => {
        const isFolder = this.isFolder(p);

        if (isFolder) this.ReadFolder(p);
        else {
            const file = fs.readFileSync(path.join(p), "utf-8");
            const parsed = path.parse(path.join(p));
            const name = parsed.name + parsed.ext;

            this.validator.logger.execute("Валидация...");

            const valid = this.validator.init(file);

            if (!valid)
                throw new Error(`Файл ${name} не валиден`);
            else this.validator.logger.execute(`Файл ${name} успешно прошёл валидацию`);
        };
    };

    private readonly ReadFolder = (p: string) => {
        const files = fs.readdirSync(path.join(p));

        this.logger.execute("Чтение папки " + path.parse(path.join(p)).name);

        for(const file of files) {
            const parsed = path.parse(path.join(p, file));
            const fileName = parsed.name + (parsed.ext === "" ? "" : parsed.ext);

            this.logger.execute(`Чтение ${parsed.ext === "" ? "папки" : "файла"} ${fileName}`);

            this.ReadFile(path.join(p, file));
        };
    };

    private init() {
        this.ReadFolder(this._path);
    };
};

(() => {
    new Reader();
})();

export default Reader;
