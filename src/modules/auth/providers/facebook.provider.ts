
import * as FB from 'fb';
import { ApiError } from '../../../common/responses/api-error';

export class FacebookAuthProvider {
  private fb;

  constructor(private readonly fbAppId: string) {
    this.fb = new FB.Facebook({
      appId: fbAppId,
    });
  }

  async verify(token: string) {
    this.fb.setAccessToken(token);

    try {
      const result = await this.fb.api('me?fields=email,picture.width(320).height(320),name,first_name,last_name,link');

      if (!result || result.error) {
        throw new ApiError('FB_REGISTER_FAILED', 'FB_REGISTER_FAILED');
      }

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        avatar: `https://graph.facebook.com/${result.id}/picture?width=500&height=500`,
      };
    } catch (error) {
      throw new ApiError('FB_API_FAILED', 'FB_API_FAILED');
    }
  }
}
