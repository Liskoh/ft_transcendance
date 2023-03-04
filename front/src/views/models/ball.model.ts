export class Ball {
    ballDoc: HTMLElement;

    constructor(doc: Document) {
        this.ballDoc = doc.getElementById('ball');
    }

    move(top: number, left: number) {
        this.ballDoc.style.top = top + "%";
        this.ballDoc.style.left = left + "%";
    }

    resetPlace(top: number, left: number) {
        this.ballDoc.style.top = top + "%";
        this.ballDoc.style.left = left + "%";
    }
}