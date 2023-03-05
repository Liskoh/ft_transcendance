export class Player {
    scoreDoc: HTMLElement;
    paddleDoc: HTMLElement;

    constructor(doc: Document, score: string, paddle: string) {
        this.scoreDoc = doc.getElementById(score);
        this.paddleDoc = doc.getElementById(paddle);
    }

    move(top: number) {
        console.log(top);
        this.paddleDoc.style.top = top + "%";
    }

    resetPlace(top: number) {
        this.paddleDoc.style.top = top + "%";
    }
}
