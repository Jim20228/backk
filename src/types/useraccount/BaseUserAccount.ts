import _IdAndCaptcha from "../id/_IdAndCaptcha";
import Unique from "../../decorators/typeproperty/Unique";
import { IsString, MaxLength } from "class-validator";
import Private from "../../decorators/typeproperty/Private";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import IsSubject from "../../decorators/typeproperty/IsSubject";

export default class BaseUserAccount extends _IdAndCaptcha  {
  @IsUndefined({ groups: ['__backk_create__', '__backk_update__'] })
  @Unique()
  @IsString()
  @MaxLength(255)
  @IsSubject()
  @Private()
  readonly subject!: string;
}
