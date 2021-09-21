export default async (req, res) => {
  // const confessions = await getAvailableConfessions();
  res
    .status(200)
    .json({
      test: 'hi from tha api',
    });
};
