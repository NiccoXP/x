router.get('/messages/search', auth, async (req, res) => {
  const { query, chatId } = req.query;
  
  const results = await Message.aggregate([
    {
      $search: {
        index: "default", // You must create this index in Atlas
        text: {
          query: query,
          path: "content",
          fuzzy: { maxEdits: 1 } // Allows for typos
        }
      }
    },
    { $match: { conversationId: mongoose.Types.ObjectId(chatId) } }
  ]);

  res.json(results);
});
