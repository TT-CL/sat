type EditType = 'connect' | 'disconnect';

export class SegEdit {
  type: EditType;
  selectedIUs : Set<string>
  
  constructor(type: EditType, selectedIUs: Set<string>) {
    this.type = type
    this.selectedIUs = selectedIUs
  }
}

export class SegEditQueue {
  queue: Array<SegEdit>

  constructor() {
    this.queue = []
  }

  addSegConnection(selectedIUs: Set<string>){
    this.queue.push(new SegEdit('connect', selectedIUs))
  }

  addSegDisconnection(selectedIUs: Set<string>){
    this.queue.push(new SegEdit('disconnect', selectedIUs))
  }

  resetQueue(){
    this.queue = [] 
  }
}