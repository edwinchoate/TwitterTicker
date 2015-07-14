/*
  Tweet Scraper
 */

import controlP5.*;
import java.util.*;
import java.util.PriorityQueue;
import java.util.Comparator;
import java.lang.Thread;

ControlP5 cp5;
color background_color = color(86, 106, 117);
String filename = "";

Table dates_table;
Table analysis_table;
Table new_table;

Table keyword_data_table;
Table keyword_dates_table;


HashMap<String, ArrayList<Object>> keywordMap;

void setup() {
  size(200, 300, P3D);
  background(background_color);
  noStroke();

  cp5 = new ControlP5(this);

  // create file selection button
  cp5.addButton("select_analysis_file")
    .setPosition(0, 0)
      .setSize(200, 20)
        ;

  // create file selection button
  cp5.addButton("select_dates_file")
    .setPosition(0, 20)
      .setSize(200, 20)
        ;

  // create file selection button
  cp5.addButton("scrape")
    .setPosition(0, 100)
      .setSize(200, 50)
        ;

  // create file selection button
  cp5.addButton("aggregate")
    .setPosition(0, 170)
      .setSize(200, 50)
        ;

  setup_new_table();
}

void draw() {
}

void setup_new_table() {
  new_table = new Table();

  new_table.addColumn("date");
  new_table.addColumn("keyword");
  new_table.addColumn("keywordType");
  new_table.addColumn("sentiment");
  new_table.addColumn("sentimentType");
  new_table.addColumn("id");
  new_table.addColumn("tweet");
  new_table.addColumn("retweets");
  new_table.addColumn("favorites");
  new_table.addColumn("popularity");
}

/**********************************************************
 Methods for selecting the file with the dates (twitonomy)
 **********************************************************/
void select_dates_file() {
  selectInput("Select a file to process:", "process_dates_file");
}

void process_dates_file(File selection) {
  //give the file to the data-object, get back the path from it.
  if (selection != null) {
    dates_table = loadTable(selection.getAbsolutePath(), "header");
  }
}

/**********************************************************
 Methods for selecting the file with the analysis (sentiword)
 **********************************************************/
void select_analysis_file() {
  selectInput("Select a file to process:", "process_analysis_file");
}

void process_analysis_file(File selection) {
  //give the file to the data-object, get back the path from it.
  if (selection != null) {
    analysis_table = loadTable(selection.getAbsolutePath(), "header");
    String[] example = splitTokens(selection.getName(), "_");
    filename = example[0]+"_twitter";
  }
}

/**********************************************************
 Does the Scraping of both files, outputting a combined file
 **********************************************************/
void scrape() {
  if (dates_table == null) {
    println("No dates file selected!");
    return;
  }
  if (analysis_table == null) {
    println("No analysis file selected!");
    return;
  }

  int new_table_index = 0;
  int dates_index = 0;
  String previous_ID = analysis_table.getString(0, "ID");

  for (int i = 1; i < analysis_table.getRowCount (); i++) {
    //check the ID. if different from prev, new date, increase dates index
    String current_ID = analysis_table.getString(i, "ID");
    if (!current_ID.equals(previous_ID)) {
      previous_ID = current_ID;
      dates_index++; //move forward one date, as the tweet ID has changed
    }

    //check the phrase. if present, record phrase in new table
    String current_phrase = analysis_table.getString(i, "Phrase");
    if (current_phrase != null && !current_phrase.equals("")) {
      String phrase_sentiment =  analysis_table.getString(i, "Phrase Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_phrase, "phrase", phrase_sentiment );
      new_table_index++;
    }

    //check the entity. if present, record this too
    String current_entity = analysis_table.getString(i, "Entity");
    if (current_entity != null && !current_entity.equals("")) {
      String entity_sentiment =  analysis_table.getString(i, "Entity Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_entity, "entity", entity_sentiment);
      new_table_index++;
    }

    //check the theme. if present, record this too
    String current_theme = analysis_table.getString(i, "Theme");
    if (current_theme != null && !current_theme.equals("")) {
      String theme_sentiment =  analysis_table.getString(i, "Theme Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_theme, "theme", theme_sentiment);
      new_table_index++;
    }
  }

  println("Done Scraping!");
  saveTable(new_table, "../../data/twitter/" + filename + ".csv");
}

/*******************************************************************************************************
 
 *******************************************************************************************************/
void aggregate() {
  //get the table you just saved
  new_table = loadTable("../../data/twitter/" + filename + ".csv", "header");

  keywordMap = new HashMap<String, ArrayList<Object>>();

  //Scan through the twitter data file, 
  for (int i = 1; i < analysis_table.getRowCount (); i++) {

    //get all the stuff for this row
    String date =  new_table.getString(i, "date");
    String keyword = new_table.getString(i, "keyword");
    String keywordType = new_table.getString(i, "keywordType");
    double sentiment = Double.valueOf(new_table.getString(i, "sentiment"));
    String currentTweet = new_table.getString(i, "tweet");
    int retweets = Integer.valueOf(new_table.getString(i, "retweets"));
    int favorites = Integer.valueOf(new_table.getString(i, "favorites"));
    int popularity = Integer.valueOf(new_table.getString(i, "popularity"));

    if (keywordMap.containsKey(keyword)) {
      // do the aggregation
      ArrayList<Object> data = keywordMap.get(keyword);

      int newCount = 1 + (Integer)data.get(10);

      double newAverageSentiment = (sentiment + (Double)data.get(1)) / (double)newCount;
      int newTotalRetweets = retweets + (Integer)data.get(2);
      int newTotalFavorites = favorites + (Integer)data.get(3);
      int newTotalPopularity = popularity + (Integer)data.get(4);

      //now check if the new tweet is more popular than the old tweet
      String topTweet = (String)data.get(5);
      int topTweetRT = (Integer)data.get(6);
      int topTweetFav = (Integer)data.get(7);
      int topTweetPop = (Integer)data.get(8);

      //if the new tweet is more popular, use it as the top tweet
      if (popularity > topTweetPop) {
        topTweet = currentTweet;
        topTweetRT = retweets;
        topTweetFav = favorites;
        topTweetPop = popularity;
      }

      //add the current date to the date list
      ArrayList<String> keywordDates = (ArrayList<String>)data.get(9);
      keywordDates.add(date);

      //NOW FINALLY add in the new data over the old data.... argh idk if this was necessary or if i should
      //have just modified the old list whatever zero hour YOLO
      ArrayList<Object> newData = new ArrayList<Object>();
      newData.add(keywordType);
      newData.add(newAverageSentiment);
      newData.add(newTotalRetweets);
      newData.add(newTotalFavorites);
      newData.add(newTotalPopularity);

      //stuff for top tweet
      newData.add(topTweet);
      newData.add(topTweetRT);
      newData.add(topTweetFav);
      newData.add(topTweetPop);

      newData.add(keywordDates);
      newData.add(newCount);

      keywordMap.put(keyword, newData);
    } else {
      ArrayList<Object> data = new ArrayList<Object>();
      data.add(keywordType);
      data.add(sentiment);
      data.add(retweets);
      data.add(favorites);
      data.add(popularity);

      //stuff for top tweet... which is the current one since this is a new entry
      data.add(currentTweet);
      data.add(retweets);
      data.add(favorites);
      data.add(popularity);

      //add in dates arraylist, for our separate dates table
      ArrayList<String> keywordDates = new ArrayList<String>();
      keywordDates.add(date);
      data.add(keywordDates);

      //add the count
      data.add(1);

      keywordMap.put(keyword, data);
    }
  }

  //need to PQ the first hashmap, by popularity.
  Set<String> myKeySet = keywordMap.keySet();
  int setSize = myKeySet.size();

  //get the keyset and add it all to the priority queue
  PriorityQueue<String> myPQ = new PriorityQueue<String>(setSize, new KeyComparator<String>());
  for (String myKey : myKeySet) {
    myPQ.add(myKey);
  }

  //println(myPQ.peek());

  String[] mold = new String[setSize];
  String[] myKeyArray = myPQ.toArray(mold);

  // once you have the sorted hashmap of everything, throw the stuff in the hashmap into two csv's.
  recordKeywordsAndDates(myKeyArray);
}

/*******************************************************************************************************
 Compares to entries in the key table thing for sorting
 *******************************************************************************************************/
class KeyComparator<String> implements Comparator<String> {
  @Override
    public int compare(String x, String y) {
    ArrayList<Object> xData = keywordMap.get(x);
    int xPop = (Integer)xData.get(4);
    ArrayList<Object> yData = keywordMap.get(y);
    int yPop = (Integer)yData.get(4);
    //println("COMPARE "+ xPop + " " + yPop);
    if (xPop > yPop) {
      return -1;
    }
    if (yPop > xPop) {
      return +1;
    }
    return 0;
  }
}

/*******************************************************************************************************
 
 *******************************************************************************************************/
void record_keyword(int new_table_index, int dates_index, int analysis_index, String keyword, String sentimentType, String sentiment) {
  // Get Date
  String date = dates_table.getString(dates_index, "Date (GMT)");
  String[] tokens = splitTokens(date);
  date = tokens[0];

  // Get ID
  String id = analysis_table.getString(analysis_index, "ID");

  // Get Tweet
  String text = dates_table.getString(dates_index, "Text");

  // Get Retweets
  String rts = dates_table.getString(dates_index, "Retweet count");

  // Get Favs
  String favs = dates_table.getString(dates_index, "Favorite count");

  //calc ppopularity
  int rtsInt = Integer.valueOf(rts);
  int favsInt = Integer.valueOf(favs);
  int popDouble = (int)(rtsInt * 0.65 + favsInt  * 0.35);
  String pop = popDouble + "";

  String keywordType = "";
  keyword = keyword.trim();

  if (keyword.substring(0, 1).equalsIgnoreCase("@")) {
    keywordType = "USERNAME";
  } else if (keyword.substring(0, 1).equalsIgnoreCase("#")) {
    keywordType = "HASHTAG";
  } else if (keyword.length() >= 4 && keyword.substring(0, 4).equalsIgnoreCase("http")) {
    keywordType = "LINK";
  } else {
    keywordType = "OTHER";
  }

  // Write everything to the csv
  new_table.setString(new_table_index, "date", date);   
  new_table.setString(new_table_index, "keyword", keyword);
  new_table.setString(new_table_index, "keywordType", keywordType);
  new_table.setString(new_table_index, "sentiment", sentiment); 
  new_table.setString(new_table_index, "sentimentType", sentimentType); 
  new_table.setString(new_table_index, "id", id); 
  new_table.setString(new_table_index, "tweet", text); 
  new_table.setString(new_table_index, "retweets", rts); 
  new_table.setString(new_table_index, "favorites", favs);
  new_table.setString(new_table_index, "popularity", pop);
}

/*******************************************************************************************************
 Takes in an array of keys, then queries them in order to create 2 csv's from the data.
 *******************************************************************************************************/
void recordKeywordsAndDates(String[] keys) {
  // one is mapping the keywords (now sorted by popularity) to their data: aggregae rt, fav, pop, etc.
  // the other csv maps the keywords to lists of dates where they were used.
  
  Table keyword_data_table = new Table();
  keyword_data_table.addColumn("keyword");
  keyword_data_table.addColumn("keywordType");
  keyword_data_table.addColumn("avgSentiment");
  keyword_data_table.addColumn("totalRT");
  keyword_data_table.addColumn("totalFav");
  keyword_data_table.addColumn("totalPop");
  keyword_data_table.addColumn("topTweet");
  keyword_data_table.addColumn("topRT");
  keyword_data_table.addColumn("topFav");
  keyword_data_table.addColumn("topPop");
  
  Table keyword_dates_table = new Table();
  
  for (int i = 0; i < keys.length; i++) {
    String thisKey = keys[i];
    ArrayList<Object> myData = keywordMap.get(thisKey);
    
    //get all the data for this keyword out of the hashtable
    String type = myData.get(0) + "";
    String avgSent = myData.get(1) + "";
    String totalRT = myData.get(2) + "";
    String totalFav = myData.get(3) + "";
    String totalPop = myData.get(4) + "";
    String topTweet = myData.get(5) + "";
    String topRT = myData.get(6) + "";
    String topFav = myData.get(7) + "";
    String topPop = myData.get(8) + "";
    ArrayList<String> dates = (ArrayList<String>)myData.get(9);
    
    //write keyword data to CSV
    keyword_data_table.setString(i, "keyword", thisKey);
    keyword_data_table.setString(i, "keywordType", type);
    keyword_data_table.setString(i, "avgSentiment", avgSent);
    keyword_data_table.setString(i, "totalRT", totalRT);
    keyword_data_table.setString(i, "totalFav", totalFav);
    keyword_data_table.setString(i, "totalPop", totalPop);
    keyword_data_table.setString(i, "topTweet", topTweet);
    keyword_data_table.setString(i, "topRT", topRT);
    keyword_data_table.setString(i, "topFav", topFav);
    keyword_data_table.setString(i, "topPop", topPop);
    
    //write dates data to another CSV. top of the column is the key,
    //going down the column are the dates that keyword was used
    keyword_dates_table.setString(i, 0, thisKey);
    for(int j = 0; j < dates.size(); j++){
      String currentDate = dates.get(j);
      keyword_dates_table.setString(i, j + 1, currentDate);
    }
  }
  
  println("Done Aggregating!");
  saveTable(keyword_data_table, "../../data/twitter/" + filename + "_keyword_data.csv");
  saveTable(keyword_dates_table, "../../data/twitter/" + filename + "_keyword_dates.csv");  
}

