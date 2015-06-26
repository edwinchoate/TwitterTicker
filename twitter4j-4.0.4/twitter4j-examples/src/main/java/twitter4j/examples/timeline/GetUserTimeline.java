/*
 * Copyright 2007 Yusuke Yamamoto
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package twitter4j.examples.timeline;

import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;

import java.util.List;


import java.util.*;
import twitter4j.*;
import twitter4j.conf.*;
/**
 * @author Yusuke Yamamoto - yusuke at mac.com
 * @since Twitter4J 2.1.7
 */
public class GetUserTimeline {
    /**
     * Usage: java twitter4j.examples.timeline.GetUserTimeline
     *
     * @param args String[]
     */
    public static void main(String[] args) {
//        // gets Twitter instance with default credentials
//        Twitter twitter = new TwitterFactory().getInstance();
//        try {
//            List<Status> statuses;
//            String user;
//            if (args.length == 1) {
//                user = args[0];
//                statuses = twitter.getUserTimeline(user);
//            } else {
//                user = twitter.verifyCredentials().getScreenName();
//                statuses = twitter.getUserTimeline();
//            }
//            System.out.println("Showing @" + user + "'s user timeline.");
//            for (Status status : statuses) {
//                System.out.println("@" + status.getUser().getScreenName() + " - " + status.getText());
//            }
//        } catch (TwitterException te) {
//            te.printStackTrace();
//            System.out.println("Failed to get timeline: " + te.getMessage());
//            System.exit(-1);
//        }



//        ConfigurationBuilder cb = new ConfigurationBuilder();
//        cb.setOAuthConsumerKey("bG2MAV8EwHAE2JTRmSczlnoBp");
//        cb.setOAuthConsumerSecret("F80dRxxZU8DDkpGGuEo7KtK5avfZjRujEnHlfOr0CxZuEZXGIq");
//        cb.setOAuthAccessToken("155332288-D5fYJ8L3nL9fN85Dj5tsNqmv5WFiI3ZiagYgGSAe");
//        cb.setOAuthAccessTokenSecret("aPfEFNyp5o4wbD3QCTPjkvxvBdT5YmXaTikYhXV56qVX8");
//
//        Twitter twitter = new TwitterFactory(cb.build()).getInstance();
//
//        int pageno = 1;
//        String user = "google";
//        List statuses = new ArrayList();
//
//        while (true) {
//
//            try {
//
//                int size = statuses.size();
//                Paging page = new Paging(pageno++, 100);
//
//                statuses.addAll(twitter.getUserTimeline(user, page));
//                //twitter.getUserTimeline(user, page);
//                if (statuses.size() == size)
//                    break;
//            }
//            catch(TwitterException e) {
//
//                e.printStackTrace();
//            }
//        }
//
//        for(Object status : statuses) {
//            System.out.println(status.toString());
//        }
//
//        System.out.println("Total: "+statuses.size());



        ConfigurationBuilder cb = new ConfigurationBuilder();
        cb.setOAuthConsumerKey("bG2MAV8EwHAE2JTRmSczlnoBp");
        cb.setOAuthConsumerSecret("F80dRxxZU8DDkpGGuEo7KtK5avfZjRujEnHlfOr0CxZuEZXGIq");
        cb.setOAuthAccessToken("155332288-D5fYJ8L3nL9fN85Dj5tsNqmv5WFiI3ZiagYgGSAe");
        cb.setOAuthAccessTokenSecret("aPfEFNyp5o4wbD3QCTPjkvxvBdT5YmXaTikYhXV56qVX8");

        Twitter twitter = new TwitterFactory(cb.build()).getInstance();
        Query query = new Query("from:google");
        int numberOfTweets = 495;
        long lastID = Long.MAX_VALUE;
        ArrayList<Status> tweets = new ArrayList<Status>();
        while (tweets.size () < numberOfTweets) {
            if (numberOfTweets - tweets.size() > 100)
                query.setCount(100);
            else
                query.setCount(numberOfTweets - tweets.size());
            try {
                QueryResult result = twitter.search(query);
                tweets.addAll(result.getTweets());
                System.out.println("Gathered " + tweets.size() + " tweets");
                for (Status t: tweets)
                    if(t.getId() < lastID) lastID = t.getId();

            }

            catch (TwitterException te) {
                System.out.println("Couldn't connect: " + te);
            };
            query.setMaxId(lastID-1);
        }

        for (int i = 0; i < tweets.size(); i++) {
            Status t = (Status) tweets.get(i);

            GeoLocation loc = t.getGeoLocation();

            String user = t.getUser().getScreenName();
            String msg = t.getText();
            String time = "";
            if (loc!=null) {
                Double lat = t.getGeoLocation().getLatitude();
                Double lon = t.getGeoLocation().getLongitude();
                System.out.println(i + " USER: " + user + " wrote: " + msg + " located at " + lat + ", " + lon);
            }
            else
                System.out.println(i + " USER: " + user + " wrote: " + msg);
        }
    }
}

