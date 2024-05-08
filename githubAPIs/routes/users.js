const { User } = require('../models/user');
const Repository = require('../models/repos');
const config = require('config');
const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
  res.send('server is up');
});

// Check if user data is available in db
// if not fetch details from github
// update the database  user + repos
// if yes apply aggregation and return data
router.post('/:userId', async (req, res) => {
  const userName = req.params.userId.toLowerCase();
  let repoData;

  const user = await User.findOne({ userName });
  if (!user) {
    const userData = await fetch(`https://api.github.com/users/${req.params.userId}`, {
      method: 'get',
    });

    let data = await userData.json();

    const userResult = new User({ ...data, userName });
    await userResult.save();

    const repos = await fetch(`https://api.github.com/users/${req.params.userId}/repos?page=1&per_page=100`, {
      method: 'get',
    });

    repoData = await repos.json();

    const repoResult = new Repository({ repos: repoData, userName });
    await repoResult.save();
  }

  aggregateData = await User.aggregate([
    {
      $match: {
        userName: userName,
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        bio: 1,
        company: 1,
        blog: 1,
        userId: '$login',
        githubUrl: '$html_url',
        noOfFollowers: '$followers',
        following: '$following',
        twitterUsername: '$twitter_username',
        noOfPublicRepos: '$public_repos',
      },
    },
  ]);

  res.send(aggregateData);
});

// Check if user data is available in db
// if not return user not exists
// if yes apply aggregation and return data
router.post('/:userId/repos', async (req, res) => {
  const userName = req.params.userId.toLowerCase();
  let repoData;

  let user = await User.findOne({ userName });
  if (!user) return res.status(404).send('User not Exist');

  aggregateData = await User.aggregate([
    {
      $match: {
        userName: userName,
      },
    },
    {
      $lookup: {
        from: 'repositories',
        localField: 'userName',
        foreignField: 'userName',
        pipeline: [
          {
            $unwind: '$repos',
          },
          {
            $project: {
              repoName: '$repos.name',
              repoUrl: '$repos.html_url',
              private: '$repos.private',
              _id: 0,
            },
          },
        ],
        as: 'repoDetails',
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        bio: 1,
        company: 1,
        blog: 1,
        userId: '$login',
        githubUrl: '$html_url',
        noOfFollowers: '$followers',
        following: '$following',
        twitterUsername: '$twitter_username',
        noOfPublicRepos: '$public_repos',
        repoDetails: 1,
      },
    },
  ]);

  res.send(aggregateData);
});

module.exports = router;
