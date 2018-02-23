/*eslint-disable no-console*/
/*eslint-disable no-process-exit*/
/*eslint-disable import/no-dynamic-require*/
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const spawn = require('cross-spawn');
const argv = require('yargs').argv;

// SAR can only be published in us-east-1 currently
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_DEFAULT_REGION = 'us-east-1';

const folderPrefix = 'projects';
const appIds = {
  'nodejs-hello-world': {
    id:
      'arn:aws:serverlessrepo:us-east-1:554407330061:applications/IOpipeHelloWorld',
    bucket: 'iopipe-sar-examples'
  }
};

const exampleFiles = fs.readdirSync(path.join(__dirname, `../${folderPrefix}`));

// get folders we want to build or deploy
const folders = _.chain(exampleFiles)
  .reject(s => s.match(/^\./))
  .filter(file => {
    const toInclude = [].concat(argv.folders || argv.projects || argv._);
    if (toInclude.length) {
      return _.includes(toInclude, file);
    }
    return true;
  })
  .value();

let shouldBuild = true;
let shouldDeploy = false;

try {
  shouldBuild = JSON.parse((argv.build || 'false').toLowerCase());
  shouldDeploy = JSON.parse((argv.deploy || 'false').toLowerCase());
} catch (err) {
  _.noop(err);
}

const statuses = [];

function statusPush(result) {
  statuses.push(result.status);
}

folders.forEach(folder => {
  const { id, bucket } = appIds[folder];
  if (shouldBuild) {
    console.log(`Building ${folder}...`);
    statusPush(
      spawn.sync('yarn', ['install', '--cwd', `${folderPrefix}/${folder}`], {
        stdio: 'inherit'
      })
    );
    statusPush(
      spawn.sync(
        'sam',
        [
          'package',
          '--template-file',
          `${folderPrefix}/${folder}/template.yaml`,
          '--s3-bucket',
          bucket,
          '--output-template-file',
          `${folderPrefix}/${folder}/packaged.yaml`
        ],
        {
          stdio: 'inherit'
        }
      )
    );
  }

  if (shouldDeploy) {
    console.log(`Deploying ${folder}...`);
    const { version } = require(`../${folderPrefix}/${folder}/package.json`);
    const templateBody = fs.readFileSync(
      path.resolve(__dirname, `../${folderPrefix}/${folder}/packaged.yaml`),
      'utf8'
    );
    if (!id) {
      throw new Error(
        `No app id found for ${folder}. Add app id in src/buildDeploy.js`
      );
    }
    const uploadJson = JSON.stringify(
      JSON.stringify({
        ApplicationId: id,
        SemanticVersion: version,
        SourceCodeUrl: 'https://github.com/iopipe/aws-sar-examples',
        TemplateBody: templateBody
      })
    );

    spawn.sync(
      'aws',
      [
        'serverlessrepo',
        'create-application-version',
        '--application-id',
        id,
        '--semantic-version',
        version,
        '--cli-input-json',
        uploadJson
      ],
      {
        shell: true,
        stdio: 'inherit'
      }
    );
    process.exit(_.max(statuses));
  }
});

process.exit(_.max(statuses));
