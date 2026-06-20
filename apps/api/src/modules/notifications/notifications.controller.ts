import { Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";

@Controller("notifications")
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query("unreadOnly") unreadOnly?: string) {
    return this.notificationsService.getForUser(user.id, unreadOnly === "true");
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getUnreadCount(user.id).then((count) => ({ count }));
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.markRead(id, user.id);
  }
}
