# Contributing

To start development, clone the repo and install npm dependencies. Suggested that version 14 of node is installed because development is using it.

```
git clone https://github.com/binary-person/pademelon
cd pademelon
npm install
```

The development server can be started using the following command. Any changes you save to non browser rewrites will restart the server and any changes you make to the browser rewrites will only reload pademelon.min.js

```
npm run dev-server
```

Other commands:
- `test`: runs testing commands. Do this before pushing
- `jesttest`: just runs tests without linting, checking formatting, building, etc..
- `builddoc`: uses typedoc to generate docs from tsdoc
- `build`: builds entire src/ using typescript (outputs to lib/) and webpack (outputs to dist/)
- `prepack`: builds using production settings. also runs tests. this is run automatically before npm generates the tarball
- `demotest`: runs demo-server.ts
- `dev-server`: same thing as above but any changes you save will recompile ts files
- `format`: formats all ts files according to the prettier format standard
- `lint`: lints ts files to make sure code is using conventional practices

Before you submit a pull request, ask yourself these questions:
- Does your pull request contain a concise, readable purpose?
- Is the code maintainable and readable?
- Did you test your code thoroughly?
- Did you write unit tests?
- Did you run `npm test` without any errors?