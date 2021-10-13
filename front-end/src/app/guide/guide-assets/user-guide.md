# Idea Unit Toolkit - User Guide

This document describes the Idea Unit Toolkit website and its functionality in detail.

---

## Log in page

![](guide/img/01_welcome.png)
This is the website log in page. Currently only Google accounts are supported.
Users *are required* to log in, as we need to identify users when storing alignment behaviour data.
To log in, simply clck on the log in button and select your favored google account from Google's login page.

## Main page

![](guide/img/03_main_page.png)
The website's main page allows you to manage your saved projects and add a new one.

A list of project is shown undreneath your name. Each project has a **Go to editor** button that links to the *project editor*.

You can upload a new project by clicking on the **Start a new project** button. This will lead you to the *new project page*.
You can also upload a project backup downloaded from the *project backup page* via the **Restore from backup** button.

## New project page

![](guide/img/04_new_project_empty.png)
This page allows you to upload a new project from scratch. Each project is composed of **exactly one source text** and any number of summaries, including zero.

A popup to select a source text will appear when clicking on the **source text field**.
You can add or remove summaries by clicking on the icons in the gray box. One or more summaries can be selected together.

Once you are happy with your project, you can save it to the server via the **Save** button.

![](guide/img/05_new_project_filled.png)
*An example of a new project before submission*

## Project editor

The project editor is the main area of the website. From here you can view, edit and align the automatically generated Idea Units.

The editor is divided in sections and each section is accessible by clicking the icons in the toolbar.
In each section, you can switch between summaries by clicking on the summary name.
A drop down menu will allow you to choose another summary to display.

### Text viewer
![](guide/img/06_plain_text.png)
This section simply shows the two documents side by side.

### IU viewer
![](guide/img/07_iu_viewer.png)
This section shows the documents segmented in Idea Units.

### Segmentation editor
This section allows you to modify segmentation in case of any mistakes.

**WARNING:** modifying documents will erase any saved manual alignment.
Please make sure that the segmentation has no mistakes before proceeding to manual alignment

#### Text editor

![](guide/img/08_text_editor.png)
This section allows you to modify the document for spelling mistakes.
You can simply click on the text and start typing. Each line contains a single segment.
You can modify segmentation boundaries by moving text on new lines.

Changes need to be stored manually by pressing the **Save** button. 
The *Discontinuous IU editor* can be accessed by clicking on the **Connect Disc IUs** button on top of the editor.

#### Discontinuous IU editor

![](guide/img/09_disc_editor.png)
This section allows you to connect segments that are far away to make a *Discontinuous Idea Unit*.

Select multiple segments by clicking on them and connect them by clicking on the **Connect** button.
Connected segments can be disconnected via the **Disconnect button**.

Once again, changes need to be stored manually by pressing the **Save** button.

#### Segmentation edit example

Here is an example of how to modify segmentation.
We will divide the segment
`However, according to UNICEF(2016), about 300,000 children died`
into three parts and make a Discontinuous Idea Unit.

1. Insert a new line in the text editor section like shown in this picture.
![](guide/img/10_text_editor_after.png)
2. Click on **Connect Disc IUs** to access the Discontinuous IU editor.
As you can see, the segment is now divided in three balloons.
![](guide/img/11_disc_editor_before.png)
3. Select the two balloons `However,` and `about 300,000 children died` and click on the **Connect** buttton.
The two segments will be joined to form a new Discontinuous Idea Unit
![](guide/img/12_disc_editor_selection.png)
4. Discontinuous Idea Units are marked by a dotted line and a number prefix to distinguish them.
Once you are happy with your changes, click on the **Save** button to save your progress.
![](guide/img/13_disc_editor_connected.png)

### Alignment editor

![](guide/img/14_alignment.png)

This section allows you to manually connect Idea Units across the Source Text and the Summary.
The changes are stored automatically on the server.

The linked documents will be used to train automatic machine learning algorithm in the future.

#### Example of manual alignment

In this example we will connect two Idea units together.

1. Click on the Summary Idea Unit that you want to connect.
Idea Units that do not have alignment data will be highlighted in yellow.
In the Source Document section a suggested IU will be highlighted in red.
![](guide/img/15_alignment_suggest.png)
2. Click on the Source Idea Unit that is best suited for the Summary Idea Unit.
Multiple Source IUs can be selected at once.
![](guide/img/16_alignment_linking.png)
3. The Idea Units are already connected and your progress is already saved on the server.
Summary Idea Units that are already connected are shown in shades of green, depending on wheter they have been selected.
![](guide/img/17_alignment_aligned.png)

### Project Management page

![](guide/img/18_project_manager.png)
This page allows you to modify your project.
You can change its name, the description or upload or delete new summaries.

### Project backup page

![](guide/img/19_backup.png)
This page allows you to back up the project on your local machine or export your annotation in excel format.

The **Backup project(.iuproj)** button will allow you to backup the entire project in a single file.
You can restore your project from the *main page*.

Excel spreadsheet can be downloaded for each document in the project.
A full project spreadsheet can be downloaded via the **Export project spreadsheet(.xlsx)** button.