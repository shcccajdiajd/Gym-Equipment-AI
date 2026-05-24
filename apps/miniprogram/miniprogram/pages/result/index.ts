Page({
  data: {
    id: '',
    status: ''
  },

  onLoad(this: MiniProgramPageInstance<{ id: string; status: string }>, query: Record<string, string | undefined>) {
    this.setData({
      id: query.id ?? '',
      status: query.status ?? ''
    });
  }
});
