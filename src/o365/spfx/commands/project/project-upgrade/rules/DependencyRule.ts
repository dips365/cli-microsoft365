import { Finding, Hash } from "../";
import { Project } from "../model";
import { Rule } from "./Rule";

export abstract class DependencyRule extends Rule {
  constructor(protected packageName: string, protected packageVersion: string, protected isDevDep: boolean = false, protected isOptional: boolean = false, protected add: boolean = true) {
    super();
  }

  get title(): string {
    return this.packageName;
  }

  get description(): string {
    return `${(this.add ? 'Upgrade' : 'Remove')} SharePoint Framework ${(this.isDevDep ? 'dev ' : '')}dependency package ${this.packageName}`;
  };

  get resolution(): string {
    return this.add ? `npm update ${this.packageName}@${this.packageVersion}` :
      `npm uninstall ${this.packageName}`;
  };

  get resolutionType(): string {
    return 'cmd';
  };

  get severity(): string {
    return 'Required';
  };

  get file(): string {
    return './package.json';
  };

  visit(project: Project, findings: Finding[]): void {
    if (!project.packageJson) {
      return;
    }

    const projectDependencies: Hash | undefined = this.isDevDep ? project.packageJson.devDependencies : project.packageJson.dependencies;
    const packageVersion: string | undefined = projectDependencies ? projectDependencies[this.packageName] : undefined;
    if (this.add) {
      if (packageVersion) {
        if (packageVersion !== this.packageVersion) {
          this.addFinding(findings);
        }
      }
      else {
        if (!this.isOptional) {
          this.addFindingWithCustomInfo(this.packageName, `Install SharePoint Framework ${(this.isDevDep ? 'dev ' : '')}dependency package ${this.packageName}`, `npm i ${this.packageName}@${this.packageVersion}${(this.isDevDep ? ' -D' : '')}`, this.file, findings);
        }
      }
    }
    else {
      if (packageVersion) {
        this.addFinding(findings);
      }
    }
  }
}