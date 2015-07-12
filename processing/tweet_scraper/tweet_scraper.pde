/*
  Tweet Scraper
*/

import controlP5.*;
import java.util.*;

ControlP5 cp5;
color background_color = color(86, 106, 117);
String filename = "";

Table dates_table;
Table analysis_table;
Table new_table;

void setup(){
  size(200, 200, P3D);
  background(background_color);
  noStroke();
  
  cp5 = new ControlP5(this);
  
  // create file selection button
  cp5.addButton("select_analysis_file")
     .setPosition(0,0)
     .setSize(200, 20)
     ;
  
  // create file selection button
  cp5.addButton("select_dates_file")
     .setPosition(0,20)
     .setSize(200, 20)
     ;
  
  // create file selection button
  cp5.addButton("scrape")
     .setPosition(0,100)
     .setSize(200, 50)
     ;

  setup_new_table();
}

void setup_new_table(){
  new_table = new Table();
  
  new_table.addColumn("date");
  new_table.addColumn("keyword");
  new_table.addColumn("type");
  new_table.addColumn("sentiment");
  new_table.addColumn("id");
  new_table.addColumn("tweet");
  new_table.addColumn("retweets");
  new_table.addColumn("favorites");
}

/**********************************************************
  Methods for selecting the file with the dates (twitonomy)
**********************************************************/
void select_dates_file(){
  selectInput("Select a file to process:", "process_dates_file");
}

void process_dates_file(File selection){
  //give the file to the data-object, get back the path from it.
  if(selection != null){
    dates_table = loadTable(selection.getAbsolutePath(), "header");
  }
}

/**********************************************************
  Methods for selecting the file with the analysis (sentiword)
**********************************************************/
void select_analysis_file(){
  selectInput("Select a file to process:", "process_analysis_file");
}

void process_analysis_file(File selection){
  //give the file to the data-object, get back the path from it.
  if(selection != null){
    analysis_table = loadTable(selection.getAbsolutePath(), "header");
    String[] example = splitTokens(selection.getName(), "_");
    filename = example[0]+"_twitter";
  }
}

/**********************************************************
  Does the Scraping of both files, outputting a combined file
**********************************************************/
void scrape(){
 if(dates_table == null){
   println("No dates file selected!");
   return;
 }
 if(analysis_table == null){
   println("No analysis file selected!");
   return;
 }
 
  int new_table_index = 0;
  int dates_index = 0;
  String previous_ID = analysis_table.getString(0, "ID");

  for(int i = 1; i < analysis_table.getRowCount (); i++){
    //check the ID. if different from prev, new date, increase dates index
    String current_ID = analysis_table.getString(i, "ID");
    if(!current_ID.equals(previous_ID)){
      previous_ID = current_ID;
      dates_index++; //move forward one date, as the tweet ID has changed
    }
    
    //check the phrase. if present, record phrase in new table
    String current_phrase = analysis_table.getString(i, "Phrase");
    if(current_phrase != null && !current_phrase.equals("")){
      String phrase_sentiment =  analysis_table.getString(i, "Phrase Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_phrase, "phrase", phrase_sentiment );
      new_table_index++;
    }
    
    //check the entity. if present, record this too
    String current_entity = analysis_table.getString(i, "Entity");
    if(current_entity != null && !current_entity.equals("")) {
      String entity_sentiment =  analysis_table.getString(i, "Entity Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_entity, "entity", entity_sentiment);
      new_table_index++;
    }
    
    //check the theme. if present, record this too
    String current_theme = analysis_table.getString(i, "Theme");
    if(current_theme != null && !current_theme.equals("")){
      String theme_sentiment =  analysis_table.getString(i, "Theme Sentiment"); 
      record_keyword(new_table_index, dates_index, i, current_theme, "theme", theme_sentiment);
      new_table_index++;
    }
  }
  
  println("Done!");
  saveTable(new_table, filename + ".csv");
}


void record_keyword(int new_table_index, int dates_index, int analysis_index, String keyword, String type, String sentiment){
  // Get Date
  String date = dates_table.getString(dates_index, "Date (GMT)");
     
  // Get ID
  String id = analysis_table.getString(analysis_index, "ID");
  
  // Get Tweet
  String text = dates_table.getString(dates_index, "Text");
  
  // Get Retweets
  String rts = dates_table.getString(dates_index, "Retweet count");
  
  // Get Favs
  String favs = dates_table.getString(dates_index, "Favorite count");


  // Write everything to the csv
  new_table.setString(new_table_index, "date", date);   
  new_table.setString(new_table_index, "keyword",  keyword);
  new_table.setString(new_table_index, "type", type);  
  new_table.setString(new_table_index, "sentiment",  sentiment); 
  
  new_table.setString(new_table_index, "id", id); 
  new_table.setString(new_table_index, "tweet", text); 
  new_table.setString(new_table_index, "retweets", rts); 
  new_table.setString(new_table_index, "favorites", favs); 
  
}