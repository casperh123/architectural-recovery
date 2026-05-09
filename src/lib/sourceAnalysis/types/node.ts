import { DependencyType } from "./dependencyType";
import { Layer } from "./layer";


export class Node {
  public layer: Layer
  public type: DependencyType
  public loc: number;

  private ignorePrefixes = new Set([
    "styles",
    "package.json"
  ]);

  private presentationPrefixes = new Set([
    "pages",
    "components",
    "hooks",
    "lib"
  ]);

  private sharedPrefixes = new Set([
    "utils",
    "templates",
    "scripts"
  ]);

  private serverPrefixes = new Set([
    "server"
  ]);

  private databasePrefixes = new Set([
    "db"
  ]);
  
  constructor(    
    public path: string,
  ) {
    this.layer = this.determineLayer();
    this.type = this.determineType();
    this.loc = 0;
  }

  private determineLayer(): Layer {
    if(this.path.startsWith("@") && (!this.path.startsWith("@dokploy") || !this.path.startsWith("@/dokploy"))) {
      return Layer.Ignore;
    }

    const prefix: string = this.path.split("/")[0];

    if(this.ignorePrefixes.has(prefix)) {
      return Layer.Ignore;
    }

    if(this.presentationPrefixes.has(prefix)) {
      return Layer.Presentation;
    }

    if(this.databasePrefixes.has(prefix) || this.path.startsWith("server/db")) {
      return Layer.Database;
    }

    if(this.serverPrefixes.has(prefix)) {
      return Layer.Server;
    }

    if(this.sharedPrefixes.has(prefix)) {
        return Layer.Shared;
    }

   return Layer.Unknown;
  }


  private determineType(): DependencyType {
    if(this.path.startsWith("@") && (!this.path.startsWith("@dokploy") || !this.path.startsWith("@/dokploy"))) {
      return DependencyType.Exernal;
    }

    return DependencyType.Internal;
  }

  public toJSON() {
    return {
      path: this.path,
      layer: this.layer,
      type: this.type,
      loc: this.loc
    };
  }
}
