# front-end

Web toolkit for the evaluation of L2 Summaries.

## First Setup
Copy `src/environments/environments.ts.example` to `src/environments/environments.ts` and edit the environment file. The Telemetry package is optional.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

**Note**: Without running the server through Traefik you won't be able to interface with the MongoDB and the FastAPI instances, breaking basic functionality. Use `ng serve` to fix broken npm dependencies or update Angular, when actually testing the website run the project through Docker Compose and create a volume `./front-end:/opt/ng` to enable direct reloads after the files are changed. When routed through Traefik the website is accessible from `http://localhost:5000/`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.