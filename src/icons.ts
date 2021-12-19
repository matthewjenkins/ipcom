import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faBackward,
  faForward,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

library.add(faPlay, faPause, faForward, faBackward);

dom.watch();
