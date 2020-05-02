import fs from 'fs';
import util from 'util';
import path from 'path';

const getAvailableConfessions = async () => {
    const folders = await readDir("./data/");
    return Promise.all(
        folders.map(async (folder) => {
            console.log("CWD: ", process.cwd());
            const contents = await readDir(`./data/${folder}`);
            return Promise.resolve({
                folder,
                contents
            });
        })
    );
};

const readDir = util.promisify(fs.readdir);

export default async (req, res) => {
    const confessions = await getAvailableConfessions();
    res
        .status(200)
        .json({
            confessions
        });
}