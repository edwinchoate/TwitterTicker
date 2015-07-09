/*
  Tweet Scraper
*/

import controlP5.*;
import java.util.*;

ControlP5 cp5;
color background_color = color(86, 106, 117);
String filename = "Amazon";

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

void draw(){
  
}

void setup_new_table(){
  new_table = new Table();
  
  new_table.setString(0, 0, "Date");
  new_table.setString(0, 1, "Keyword");
  new_table.setString(0, 2, "Keyword Type");
  new_table.setString(0, 3, "Sentiment");
  new_table.setString(0, 4, "ID");
  new_table.setString(0, 5, "Tweet");
  new_table.setString(0, 6, "Retweets");
  new_table.setString(0, 7, "Favorites"); 
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
    dates_table = loadTable(selection.getAbsolutePath(), "csv");
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
    analysis_table = loadTable(selection.getAbsolutePath(), "csv");
  }
}

/**********************************************************
  Does the Scraping of both files, outputting a combined file
**********************************************************/
void scrape(){
//  if(dates_table == null){
//    println("No dates file selected!");
//    return;
//  }
//  if(analysis_table == null){
//    println("No analysis file selected!");
//    return;
//  }
  
  int new_table_index = 1;
  int dates_index = 1;
  String previous_ID = analysis_table.getString(1, 0);
  
  for(int i = 1; i < analysis_table.getRowCount (); i++){
    
    //check the ID. if different from prev, new date, increase dates index
    String current_ID = analysis_table.getString(i, 0);
    if(!current_ID.equals(previous_ID)){
      previous_ID = current_ID;
      dates_index++; //move forward one date, as the tweet ID has changed
    }
    
    //check the phrase. if present, record phrase in new table
    String current_phrase = analysis_table.getString(i, 11);
    if(!current_phrase.equals("")){
      String phrase_sentiment =  analysis_table.getString(i, 12); 
      record_keyword(new_table_index, dates_index, i, current_phrase, "phrase", phrase_sentiment );
      new_table_index++;
    }
    
    //check the entity. if present, record this too
    String current_entity = analysis_table.getString(i, 15);
    if(!current_entity.equals("")){
      String entity_sentiment =  analysis_table.getString(i, 17); 
      record_keyword(new_table_index, dates_index, i, current_entity, "entity", entity_sentiment);
      new_table_index++;
    }
    
    //check the theme. if present, record this too
    String current_theme = analysis_table.getString(i, 20);
    if(!current_theme.equals("")){
      String theme_sentiment =  analysis_table.getString(i, 21); 
      record_keyword(new_table_index, dates_index, i, current_theme, "theme", theme_sentiment);
      new_table_index++;
    }
  }
  
  println("Done!");
  saveTable(new_table, filename + ".csv");
  
}


void record_keyword(int new_table_index, int dates_index, int analysis_index, String keyword, String type, String sentiment){
  // Get Date
  String date = dates_table.getString(dates_index, 0);
     
  // Get ID
  String id = analysis_table.getString(analysis_index, 0);
  
  // Get Tweet
  String text = dates_table.getString(dates_index, 3);
  
  // Get Retweets
  String rts = dates_table.getString(dates_index, 7);
  
  // Get Favs
  String favs = dates_table.getString(dates_index, 8);


  // Write everything to the csv
  new_table.setString(new_table_index, 0, date);   

  new_table.setString(new_table_index, 1, keyword);
  new_table.setString(new_table_index, 2, type);  
  new_table.setString(new_table_index, 3, sentiment); 
  
  new_table.setString(new_table_index, 4, id); 
  new_table.setString(new_table_index, 5, text); 
  new_table.setString(new_table_index, 6, rts); 
  new_table.setString(new_table_index, 7, favs); 
  
}


