import * as Fs from 'fs';
import * as Path from 'path';
import * as yargsParser from 'yargs-parser';
import { groupBy } from 'lodash';

const getContrastRatio = require('get-contrast-ratio').default;

async function main(cli: { [flag: string]: string | number | boolean }) {
    const cwd = Path.resolve(process.cwd(), typeof cli.cwd === 'string' ? cli.cwd : '.');

    if (typeof cli.colorPath === 'undefined') {
        console.error(`--color-path is required`);
        process.exit(1);
    }

    const colorPath = Path.resolve(cwd, cli.colorPath as string); 
    const accessResult = await access(colorPath);

    const maybeMinRatio = parseFloat(cli.minRatio as string);
    const minRatio = !Number.isNaN(maybeMinRatio) ? maybeMinRatio : 4.5;
    const delimiter = typeof cli.delimiter === 'string' ? cli.delimiter : ',';

    if (accessResult instanceof Error) {
        console.error(`can not access file at --color-path: ${colorPath}`);
        console.trace(accessResult);
        process.exit(1);
    }

    const fileResult = await read(colorPath);

    if (fileResult instanceof Error) {
        console.error(`can not read file at --color-path: ${colorPath}`);
        console.trace(fileResult);
        process.exit(1);
    }

    const data = JSON.parse(fileResult as string);
    const colors = data.colors.filter((c: any) => c.value.startsWith('#'));

    const results = product(colors)
        .map(([a, b]: any[]) => {
            const ratio = getContrastRatio(a.value, b.value);

            return {
                a,
                b,
                ratio
            }
        });

    const rows = groupBy(results, 'a.name');
    const thead = ['', ...Object.keys(rows)].join(delimiter);
    const tbody = Object.entries(rows)
        .map(([label, cells]) => [label, ...cells.map(cell => cell.ratio >= minRatio ? `✅` : `⚠️`)].join(delimiter))
        .join('\n');

    console.log([thead, tbody].join('\n'));
}

async function access(path: string) {
    return new Promise((resolve, reject) => {
        Fs.access(path, err => err === null ? resolve(true) : resolve(err));
    });
}

async function read(path: string) {
    return new Promise((resolve, reject) => {
        Fs.readFile(path, (err, data) => err === null ? resolve(data) : resolve(err));
    });
}

function product<T>(list: T[]): T[][] {
    return list
        .map(a => list.map(b => [a, b]))
        .reduce((acc, ab) => [...acc, ...ab]);
}

main(yargsParser(process.argv.slice(2)))
    .catch((err) => {
        throw err;
    })