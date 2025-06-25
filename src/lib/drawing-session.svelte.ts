export interface Image {
    url: string;
    // Path to the image file (for local files). Can be converted to a URL using convertFileSrc.
    path?: string;
}

export class DrawingSession {
    // Array of images to be displayed in the session
    public imgs: Image[];
    // Index of the current image being displayed
    public curImgIdx: number;
    public nCompletedImgs: number;
    // Time each image is displayed for, in seconds
    public imgShowTime: number;
    // Time remaining for the current image to be displayed, in seconds
    public timeRemaining: number;
    // Total time drawing (not paused), in seconds
    public timeSpent: number;
    // Timer interval that updates the time remaining with each tick
    public timer: NodeJS.Timeout | undefined = undefined;
    public isPaused: boolean;

    constructor(imgs: Image[], imgShowTime: number) {
        this.imgs = imgs;
        this.curImgIdx = $state(0);
        this.nCompletedImgs = $state(0);
        this.imgShowTime = imgShowTime;
        this.timeRemaining = $state(imgShowTime);
        this.timeSpent = 0;
        this.timer = undefined;
        this.isPaused = $state(false);
    }

    getCurImg = () => {
        return this.imgs[this.curImgIdx];
    };

    goPrevImg = () => {
        this.curImgIdx -= 1;
        if (this.curImgIdx < 0) this.curImgIdx = this.imgs.length - 1;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this.restartTimer();
    };

    goNextImg = () => {
        this.curImgIdx += 1;
        if (this.curImgIdx >= this.imgs.length) this.curImgIdx = 0;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this.restartTimer();
    };

    pause = () => {
        this.isPaused = true;
        this.clearTimer();
    };

    resume = () => {
        this.isPaused = false;
        this.restartTimer();
    };

    togglePause = () => {
        if (this.isPaused) this.resume();
        else this.pause();
    };

    restartTimer = () => {
        this.clearTimer();
        this.timer = setInterval(async () => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timeSpent++;
            } else {
                this.nCompletedImgs += 1;
                this.goNextImg();
            }
        }, 1000);
    };

    clearTimer = () => {
        clearInterval(this.timer);
    };
}

export const currentSession = $state({
    object: new DrawingSession([], 0),
});
