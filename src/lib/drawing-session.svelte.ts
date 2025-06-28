export interface Image {
    url: string;
    // Path to the image file (for local files). Can be converted to a URL using convertFileSrc.
    path?: string;
}

export class DrawingSession {
    // Array of images to be displayed in the session
    imgs: Image[];
    // Time each image is displayed for, in seconds
    imgShowTime: number;
    nCompletedImgs: number;
    // Time remaining for the current image to be displayed, in seconds
    timeRemaining: number;
    // Total time spent drawing (not paused), in seconds
    timeSpent: number;
    isPaused: boolean;
    // Index of the current image being displayed
    private _curImgIdx: number;
    // Timer interval that updates the time remaining with each tick
    private _timer: NodeJS.Timeout | undefined = undefined;

    constructor(imgs: Image[], imgShowTime: number) {
        this.imgs = imgs;
        this.imgShowTime = imgShowTime;
        this.nCompletedImgs = $state(0);
        this.timeRemaining = $state(imgShowTime);
        this.timeSpent = 0;
        this.isPaused = $state(true);

        this._curImgIdx = $state(0);
        this._timer = undefined;
    }

    getCurImg = () => {
        return this.imgs[this._curImgIdx];
    };

    goPrevImg = () => {
        this._curImgIdx -= 1;
        if (this._curImgIdx < 0) this._curImgIdx = this.imgs.length - 1;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this._restartTimer();
    };

    goNextImg = () => {
        this._curImgIdx += 1;
        if (this._curImgIdx >= this.imgs.length) this._curImgIdx = 0;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this._restartTimer();
    };

    pause = () => {
        this.isPaused = true;
        this._clearTimer();
    };

    resume = () => {
        this.isPaused = false;
        this._restartTimer();
    };

    togglePause = () => {
        if (this.isPaused) this.resume();
        else this.pause();
    };

    private _restartTimer = () => {
        this._clearTimer();
        this._timer = setInterval(async () => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timeSpent++;
            } else {
                this.nCompletedImgs += 1;
                this.goNextImg();
            }
        }, 1000);
    };

    private _clearTimer = () => {
        clearInterval(this._timer);
    };
}

export const currentSession = $state({
    object: new DrawingSession([], 0),
});
