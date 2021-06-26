import { RTCMaster as KinesisMaster, RTCViewer as KinesisViewer } from "./kinesis"
import { RTCMaster as SkywayMaster, RTCViewer as SkywayViewer } from "./skyway"

export default class RTC {
    public Master: KinesisMaster | SkywayMaster
    public Viewer: KinesisViewer | SkywayViewer
    constructor(module: "kinesis" | "skyway") {
        switch (module) {
            case "kinesis":
                this.Master = new KinesisMaster()
                this.Viewer = new KinesisViewer()
                break;
            case "skyway":
                this.Master = new SkywayMaster()
                this.Viewer = new SkywayViewer()
                break;
        }
    }
}