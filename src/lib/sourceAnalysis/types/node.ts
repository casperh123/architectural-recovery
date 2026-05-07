import { Layer } from "./layer";


export class Node {
  public layer: Layer
  public type: DependencyType
  
  constructor(    
    public name: string,
    public path: string,
    public loc: number) {
    this.layer = this.determineLayer();
    this.type = this.determineType();
  }

  private determineLayer(): Layer {
    if(this.path.startsWith("db")) {
      return Layer.Database;
    }

    return Layer.Unknown;
  }


  private determineType(): DependencyType {
    if(this.path.startsWith("@")) {
      return DependencyType.Exernal;
    }

    if(this.path.startsWith("/")) {
      return DependencyType.Internal;
    }
      
    return DependencyType.Unknown;
  }
}
