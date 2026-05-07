import { DependencyType } from "./dependencyType";
import { Layer } from "./layer";


export class Node {
  public layer: Layer
  public type: DependencyType
  public loc: number;
  
  constructor(    
    public path: string,
  ) {
    this.layer = this.determineLayer();
    this.type = this.determineType();
    this.loc = 0;
  }

  private determineLayer(): Layer {
    if(this.path.startsWith("@") && (!this.path.startsWith("@dokploy") || !this.path.startsWith("@/dokploy"))) {
      return Layer.External;
    }

    if(this.path.startsWith("db") || this.path.startsWith("server/db")) {
      return Layer.Database;
    }

    if(this.path.startsWith("server")) {
      return Layer.Server;
    }

    if(
      this.path.startsWith("utils") ||
      this.path.startsWith("lib") ||
      this.path.startsWith("scripts") || 
      this.path.startsWith("templates")
    ) {
        return Layer.Shared;
    }

    if(
      this.path.startsWith("pages") ||
      this.path.startsWith("styles") ||
      this.path.startsWith("components") ||
      this.path.startsWith("hooks")
    ) {
      return Layer.Presentation;
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
